from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
import api.models.analysis as analysis_model
import api.models.rule as rule_model
import api.models.stage as stage_model
import api.models.weapon as weapon_model
import api.schemas.analysis as analysis_schema
import api.cruds.rule as rule_crud
import api.cruds.stage as stage_crud
import api.cruds.weapon as weapon_crud
from sqlalchemy import or_, and_, between
from sqlalchemy.sql import text
import datetime
import random
import itertools

# 好みの問題だけど、引数が多い関数は使いにくい
# これはまだ型が違うからマシだけど、user_idもstr, idもstrだった場合、第二引数と第三引数に渡す変数を間違える可能性は大いにある
# もう少し抽象的にいうと、プリミティブ型の引数を増やすのはヒューマンエラーが入り込む余地を与えてしまう
# マシにするには、引数をオブジェクトとすること（特にTypeScriptだとショートハンドなどで書くとミスが減ると思ってる）


async def get(db: AsyncSession, user_id: str, id: int) -> analysis_schema.GetAnalysisResponse:
    result = (await (db.execute(select(analysis_model.Analysis.id, analysis_model.Analysis.battle_type, analysis_model.Analysis.game_date_time, analysis_model.Analysis.point, analysis_model.Analysis.victory_defeat, analysis_model.Analysis.user_id, stage_model.Stage.name.label('stage'), weapon_model.Weapon.main.label('weapon'), rule_model.Rule.name.label('rule'))
                                .outerjoin(stage_model.Stage, analysis_model.Analysis.stage_id == stage_model.Stage.id)
                                .outerjoin(rule_model.Rule, analysis_model.Analysis.rule_id == rule_model.Rule.id)
                                .outerjoin(weapon_model.Weapon, analysis_model.Analysis.weapon_id == weapon_model.Weapon.id)
                                .filter(analysis_model.Analysis.id == id)
                                .filter(analysis_model.Analysis.user_id == user_id)))).all()

    if len(result) == 0:
        raise HTTPException(
            status_code=404, detail=f"not found this id:{id}, user_id:{user_id}")

    analysis = result[0]
    return analysis


async def get_pure(db: AsyncSession, user_id: str, id: int):
    result = (await db.execute(select(analysis_model.Analysis).filter(analysis_model.Analysis.id == id).filter(analysis_model.Analysis.user_id == user_id))).first()
    if len(result) == 0:
        raise HTTPException(
            status_code=404, detail=f"not found this id:{id}, user_id:{user_id}")

    return result[0]


async def update(db: AsyncSession, update_analysis: analysis_schema.AddAnalysisDataRequest):
    analysis = await get_pure(db, update_analysis.user_id, update_analysis.id)
    analysis.victory_defeat = update_analysis.victory_defeat
    analysis.battle_type = update_analysis.battle_type
    analysis.stage_id = update_analysis.stage_id
    analysis.rule_id = update_analysis.rule_id
    analysis.weapon_id = update_analysis.weapon_id
    analysis.game_date_time = datetime.datetime.strptime(
        update_analysis.game_date_time,  '%Y-%m-%d %H:%M:%S')
    analysis.point = update_analysis.point
    db.add(analysis)
    await db.commit()


async def _delete(db: AsyncSession, user_id: str, id: int):
    analysis = await get_pure(db, user_id, id)
    await db.delete(analysis)
    await db.commit()


async def delete_on_cancel(db: AsyncSession, user_id: str):
    await db.execute(delete(analysis_model.Analysis).filter(analysis_model.Analysis.user_id == user_id))


async def add_data(db: AsyncSession, input_analyses: list[analysis_schema.Analysis]):
    for input_analysis in input_analyses:
        analysis = analysis_model.Analysis(**input_analysis.dict())
        analysis.game_date_time = datetime.datetime.strptime(
            analysis.game_date_time,  '%Y-%m-%d %H:%M:%S')
        db.add(analysis)
    await db.commit()


async def search(db: AsyncSession, param: analysis_schema.SearchAnalysisRequest):
    query = create_search_query(param)
    result = (await db.execute(query)).all()

    return list(map(lambda datum: {"id": datum.id, "battle_type": datum.battle_type, "game_date_time": datum.game_date_time, "point": datum.point, "victory_defeat": datum.victory_defeat, "user_id": datum.user_id, "stage": datum.stage, "weapon": datum.weapon, "rule": datum.rule}, result))


async def calc_point_transition(db: AsyncSession, param: analysis_schema.CalculationPointTransitionRequest):
    query = create_extract_point_transition_query(param)
    result = (await db.execute(query)).all()
    return (list(map(lambda it: str(it[0]), result)), list(map(lambda it: it[1], result)))


async def calc_victory_rate(db: AsyncSession, rule: bool, stage: bool, weapon: bool, battle_type: bool, user_id: str):
    query = create_victory_rate_query(
        user_id, rule, stage, weapon, battle_type)
    result = await db.execute(text(query))
    # 生のSQLを実行すると列名と値がマッピングされていないので(カラムの順番と値の順番は正しい)
    # なので、こちらで列名と値を紐づけたオブジェクトを作って返す
    columns = list(result.keys())
    rows = result.all()
    victory_rates = []
    for row in rows:
        temp = {}
        for i in range(len(columns)):
            temp[columns[i]] = row[i]
        victory_rates.append(temp)
    return victory_rates


def create_extract_point_transition_query(param: analysis_schema.CalculationPointTransitionRequest):
    query = select(analysis_model.Analysis.game_date_time, analysis_model.Analysis.point) \
        .filter(analysis_model.Analysis.user_id == param.user_id) \
        .filter(between(analysis_model.Analysis.game_date_time, datetime.datetime.strptime(param.range.start,  '%Y-%m-%d %H:%M:%S'), datetime.datetime.strptime(param.range.end,  '%Y-%m-%d %H:%M:%S'))) \
        .filter(analysis_model.Analysis.battle_type == param.battle.type) \
        .filter(analysis_model.Analysis.point != None)
    if param.battle.type == 'x':
        query = query.filter(
            analysis_model.Analysis.rule_id == param.battle.rule_id)
    query = query.order_by(analysis_model.Analysis.game_date_time)
    return query


def create_victory_rate_query(user_id: str, rule: bool, stage: bool, weapon: bool, battle_type: bool):
    groups = []
    columns = []
    join_tables = []

    # 引数のパラメータに応じて、SQLのGROUP BY句、SELECT句、JOIN句にあたる文言を生成する
    if rule:
        groups.append('rule_id')
        columns.append('RULES.name as rule_name')
        join_tables.append('LEFT JOIN RULES ON rule_id = RULES.id ')

    if stage:
        groups.append('stage_id')
        columns.append('STAGES.name as stage_name')
        join_tables.append('LEFT JOIN STAGES ON stage_id = STAGES.id ')

    if weapon:
        groups.append('weapon_id')
        columns.append('WEAPONS.main as weapon_main')
        join_tables.append('LEFT JOIN WEAPONS ON weapon_id = WEAPONS.id ')

    if battle_type:
        groups.append('battle_type')
        columns.append('battle_type')

    query = f"SELECT \
                {','.join(columns)}, \
                SUM(CASE WHEN victory_defeat = 'win' THEN 1 ELSE 0 END) / COUNT(*) AS victory_rate \
            FROM \
                ANALYSES \
            {''.join(join_tables)}  \
            WHERE \
                user_id = '{user_id}' \
            GROUP BY \
                {','.join(groups)};"
    return query


def create_search_query(param: analysis_schema.SearchAnalysisRequest):
    query = select(analysis_model.Analysis.id,
                   analysis_model.Analysis.battle_type,
                   analysis_model.Analysis.game_date_time,
                   analysis_model.Analysis.point,
                   analysis_model.Analysis.victory_defeat,
                   analysis_model.Analysis.user_id,
                   stage_model.Stage.name.label('stage'),
                   weapon_model.Weapon.main.label('weapon'),
                   rule_model.Rule.name.label('rule')) \
        .outerjoin(stage_model.Stage, analysis_model.Analysis.stage_id == stage_model.Stage.id) \
        .outerjoin(rule_model.Rule, analysis_model.Analysis.rule_id == rule_model.Rule.id) \
        .outerjoin(weapon_model.Weapon, analysis_model.Analysis.weapon_id == weapon_model.Weapon.id) \
        .filter(analysis_model.Analysis.user_id == param.user_id)  # user_idは必ず必要なのでここでつける
    return create_search_query_where_clause(query, param)


def create_search_query_where_clause(query: str, param: analysis_schema.SearchAnalsisParam):
    where_clause = []
    if len(param.victory_defeats) > 0:
        where_clause.append(
            analysis_model.Analysis.victory_defeat.in_(param.victory_defeats))
    if len(param.battle_types) > 0:
        where_clause.append(
            analysis_model.Analysis.battle_type.in_(param.battle_types))
    if len(param.rules) > 0:
        where_clause.append(analysis_model.Analysis.rule_id.in_(param.rules))
    if len(param.stages) > 0:
        where_clause.append(analysis_model.Analysis.stage_id.in_(param.stages))
    if len(param.weapons) > 0:
        where_clause.append(
            analysis_model.Analysis.weapon_id.in_(param.weapons))
    # TODO: ここのパラメータはもうちょい厳しく評価すべき
    if len(param.start) > 0 or len(param.end) > 0:
        where_clause.append(
            create_game_date_time_clause(param.start, param.end))
    if param.is_and_search:
        return query.filter(
            and_(*where_clause))
    else:
        return query.filter(
            or_(*where_clause))


def create_game_date_time_clause(start: str, end: str):
    if len(start) > 0 and len(end) > 0:
        return and_(*[analysis_model.Analysis.game_date_time >= start, analysis_model.Analysis.game_date_time <= end])
    if len(start) > 0:
        return analysis_model.Analysis.game_date_time >= start
    if len(end) > 0:
        return analysis_model.Analysis.game_date_time <= end

# TODO　このメソッドはDBに関係ないメソッドなんだから、このcruds/に置いてあるのはおかしい


def get_enum(column: str):
    if column == 'battle_type':
        battles = analysis_model.BattleTypeEnum
        return [
            {
                "label": battles.x,
                "value": "x"
            },
            {
                "label": battles.challenge,
                "value": "challenge"
            },
            {
                "label": battles.open,
                "value": "open"
            },
        ]
    elif column == 'victory_defeat':
        victory_defeats = analysis_model.VictoryDefeatEnum
        return [
            {
                "label": victory_defeats.win,
                "value": "win"
            },
            {
                "label": victory_defeats.lose,
                "value": "lose"
            },
            {
                "label": victory_defeats.draw,
                "value": "draw"
            },
        ]


async def seed(db: AsyncSession):
    await db.execute(delete(analysis_model.Analysis))
    user_id = "dummy"
    battles = analysis_model.BattleTypeEnum
    rule_ids = list(map(lambda rule: rule.id, (await rule_crud.get_all_rules(db))))
    stage_ids = list(map(lambda stage: stage.id, (await stage_crud.get_all_stages(db))))
    weapon_ids = list(map(lambda weapon: weapon.id, (await weapon_crud.get_all_weapons(db))))

    samples = []
    x_samples = generate_dummies_by_battle_type(
        user_id, battles.x, rule_ids, random.sample(stage_ids, 2), random.sample(weapon_ids, 5))
    open_samples = generate_dummies_by_battle_type(
        user_id, battles.open, rule_ids, random.sample(stage_ids, 2), random.sample(weapon_ids, 10))
    challenge_samples = generate_dummies_by_battle_type(
        user_id, battles.challenge, rule_ids, random.sample(stage_ids, 2), random.sample(weapon_ids, 7))

    samples.append(x_samples)
    samples.append(open_samples)
    samples.append(challenge_samples)
    flat_samples = list(itertools.chain(*samples))

    db.add_all(flat_samples)
    await db.commit()


def generate_dummies_by_battle_type(user_id: str, battle_type: str, rule_ids: list[int], stage_ids: list[int], weapon_ids: list[int]):
    samples = []
    game_date_time = datetime.datetime.now()
    if battle_type == analysis_model.BattleTypeEnum.x:
        # 3勝2敗でデータを作る
        for index in range(len(rule_ids)):
            rule = rule_ids[index]
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.win,  game_date_time.replace(
                hour=(1+index * 2), minute=0, second=0).strftime('%Y-%m-%d %H:%M:%S'),  rule, random.choice(stage_ids), random.choice(weapon_ids), None))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.lose, game_date_time.replace(
                hour=(1+index * 2), minute=10, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), None))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.win,  game_date_time.replace(
                hour=(1+index * 2), minute=20, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), None))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.lose, game_date_time.replace(
                hour=(1+index * 2), minute=30, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), None))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.win,  game_date_time.replace(
                hour=(1+index * 2), minute=40, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), 2000 + index * 100))
    elif battle_type == analysis_model.BattleTypeEnum.open:
        # 1ルール 10試合作る
        for index in range(len(rule_ids)):
            rule = rule_ids[index]
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.win,  game_date_time.replace(
                hour=(9+index * 2), minute=0,  second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), 1000))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.lose, game_date_time.replace(
                hour=(9+index * 2), minute=10, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), 995))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.win,  game_date_time.replace(
                hour=(9+index * 2), minute=20, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), 1003))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.lose, game_date_time.replace(
                hour=(9+index * 2), minute=30, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), 998))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.win,  game_date_time.replace(
                hour=(9+index * 2), minute=40, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), 1006))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.lose, game_date_time.replace(
                hour=(10+index * 2), minute=0,  second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), 1001))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.win,  game_date_time.replace(
                hour=(10+index * 2), minute=10, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), 1009))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.lose, game_date_time.replace(
                hour=(10+index * 2), minute=20, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), 1004))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.win,  game_date_time.replace(
                hour=(10+index * 2), minute=30, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), 1012))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.lose, game_date_time.replace(
                hour=(10+index * 2), minute=40, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), 1007))
    elif battle_type == analysis_model.BattleTypeEnum.challenge:
        # 5勝2敗でデータを作る
        for index in range(len(rule_ids)):
            rule = rule_ids[index]
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.win,  game_date_time.replace(
                hour=(17+index * 2), minute=0, second=0).strftime('%Y-%m-%d %H:%M:%S'),  rule, random.choice(stage_ids), random.choice(weapon_ids), None))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.lose, game_date_time.replace(
                hour=(17+index * 2), minute=10, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), None))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.win,  game_date_time.replace(
                hour=(17+index * 2), minute=20, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), None))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.lose, game_date_time.replace(
                hour=(17+index * 2), minute=30, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), None))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.win,  game_date_time.replace(
                hour=(17+index * 2), minute=40, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), None))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.win,  game_date_time.replace(
                hour=(17+index * 2), minute=50, second=0).strftime('%Y-%m-%d %H:%M:%S'), rule, random.choice(stage_ids), random.choice(weapon_ids), None))
            samples.append(generate_dummy_analysis(user_id, battle_type, analysis_model.VictoryDefeatEnum.win,  game_date_time.replace(
                hour=(17+index * 2), minute=0, second=0).strftime('%Y-%m-%d %H:%M:%S'),  rule, random.choice(stage_ids), random.choice(weapon_ids), 1100))
    return samples


def generate_dummy_analysis(user_id: str, battle_type: str, victory_defeat: str, game_date_time: datetime, rule_id: int, stage_id: int, weapon_id: int, point: int):
    analysis = {
        "user_id": user_id,
        "battle_type": battle_type,
        "victory_defeat": victory_defeat,
        "game_date_time": game_date_time,
        "rule_id": rule_id,
        "stage_id": stage_id,
        "weapon_id": weapon_id,
        "point": point
    }

    return analysis_model.Analysis(**analysis)