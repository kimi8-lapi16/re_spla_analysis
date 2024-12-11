--
-- PostgreSQL database dump
--

-- Dumped from database version 17.1 (Debian 17.1-1.pgdg120+1)
-- Dumped by pg_dump version 17.1 (Debian 17.1-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: BattleType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BattleType" AS ENUM (
    'CHALLENGE',
    'OPEN',
    'X'
);


ALTER TYPE public."BattleType" OWNER TO postgres;

--
-- Name: MatchResult; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MatchResult" AS ENUM (
    'VICTORY',
    'DEFEAT',
    'DRAW'
);


ALTER TYPE public."MatchResult" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Analysis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Analysis" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "battleType" public."BattleType" NOT NULL,
    "matchResult" public."MatchResult" NOT NULL,
    "stageId" text NOT NULL,
    "ruleId" text NOT NULL,
    "weaponId" text NOT NULL,
    "gameDateTime" date NOT NULL,
    point integer
);


ALTER TABLE public."Analysis" OWNER TO postgres;

--
-- Name: Rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Rule" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."Rule" OWNER TO postgres;

--
-- Name: Stage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Stage" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."Stage" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "mailAddress" text NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    "registerDate" date NOT NULL,
    "cancelDate" date
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: Weapon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Weapon" (
    id text NOT NULL,
    main text NOT NULL,
    sub text NOT NULL,
    special text NOT NULL
);


ALTER TABLE public."Weapon" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Analysis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Analysis" (id, "userId", "battleType", "matchResult", "stageId", "ruleId", "weaponId", "gameDateTime", point) FROM stdin;
\.


--
-- Data for Name: Rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Rule" (id, name) FROM stdin;
cm4jxi75v0000xt2fbjogzuek	ガチエリア
cm4jxi75v0001xt2f76c5s1ah	ガチヤグラ
cm4jxi75v0002xt2ftuureq6r	ガチホコバトル
cm4jxi75v0003xt2feuxxutct	ガチアサリ
\.


--
-- Data for Name: Stage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Stage" (id, name) FROM stdin;
cm4jxi76n0004xt2ftg0rjrad	ユノハナ大渓谷
cm4jxi76n0005xt2f3zvw9xru	ゴンズイ地区
cm4jxi76n0006xt2flo4ajv2c	ヤガラ市場
cm4jxi76n0007xt2fz21xqz2l	マテガイ放水路
cm4jxi76n0008xt2fiqmi86lx	ナメロウ金属
cm4jxi76n0009xt2fnedcunnk	マサバ海峡大橋
cm4jxi76n000axt2ff8ytto2z	キンメダイ美術館
cm4jxi76n000bxt2fthzdvizl	マヒマヒリゾート&スパ
cm4jxi76n000cxt2fzjfg5o2g	海女美術大学
cm4jxi76n000dxt2f51hre6a2	チョウザメ造船
cm4jxi76n000ext2fealheswi	ザトウマーケット
cm4jxi76n000fxt2fp2zv0r16	スメーシーワールド
cm4jxi76n000gxt2f28otnl3q	クサヤ温泉
cm4jxi76n000hxt2fuevwhw9f	ヒラメが丘団地
cm4jxi76n000ixt2ft75m8aw7	ナンプラー遺跡
cm4jxi76n000jxt2funnc0hc0	マンタマリア号
cm4jxi76n000kxt2fkxezxpv1	オヒョウ海運
cm4jxi76n000lxt2fo28cggtc	タカアシ経済特区
cm4jxi76n000mxt2fhw740zco	バイガイ亭
cm4jxi76n000nxt2fa2w4v6ln	ネギトロ炭鉱
cm4jxi76o000oxt2f6g6qozm9	カジキ空港
cm4jxi76o000pxt2focwxvulu	リュウグウターミナル
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "mailAddress", name, password, "registerDate", "cancelDate") FROM stdin;
cm4f8iw180000143to5u6wk00	kuwassu@example.com	くわっす	$2a$10$CNQdPM.nd1CFJiipd4pw0O/X6NrPIRKMiVGyM31IBD3XMbLPbErl2	2024-12-08	\N
cm4f8phqe0000zenmoaraq4q7	ahoy@example.com	ahoy	$2a$10$N7.tLjbjlRf5nnTi6rPPDuZZkrbDSfA2AvKVHQVLAUvFaW3NCVR0a	2024-12-08	\N
cm4f96n7w0000qt913oj4zkvo	dummy@example.com	dummy	$2a$10$5n8/LC2lmtKD6OOWoXq6D.RFDhZMjuqrDvSrtRcUh1/LMJRvCkGS6	2024-12-08	\N
cm4fc2jjw0000136bvfzddn7i	kimishima@example.com	きみしま	$2a$10$osLi2hD7qR7s6LFZgd//d.b8TmMfWkecCzKx3xZtG5i2rV/.nPCP.	2024-12-08	\N
\.


--
-- Data for Name: Weapon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Weapon" (id, main, sub, special) FROM stdin;
cm4jxi775000qxt2fbif5p4y3	わかばシューター	スプラッシュボム	グレートバリア
cm4jxi775000rxt2fqsdtk952	スプラシューター	キューバンボム	ウルトラショット
cm4jxi775000sxt2fl0mtzp3p	プロモデラーMG	タンサンボム	サメライド
cm4jxi775000txt2fvs4pnou2	N-ZAP85	キューバンボム	エナジースタンド
cm4jxi775000uxt2fbp3nm9gf	もみじシューター	トーピード	ホップソナー
cm4jxi775000vxt2f8n9777no	ボールドマーカー	カーリングボム	ウルトラハンコ
cm4jxi775000wxt2fva8sd3js	スペースシューター	ポイントセンサー	メガホンレーザー
cm4jxi775000xxt2ff0s17slb	プライムシューター	ラインマーカー	カニタンク
cm4jxi775000yxt2fw0vifkp5	52ガロン	スプラッシュシールド	メガホンレーザー
cm4jxi775000zxt2fa7ns6ewm	N-ZAP89	ロボットボム	デコイチラシ
cm4jxi7750010xt2f16fzp3bh	スペースシューターコラボ	トラップ	ジェットパック
cm4jxi7750011xt2fihfs5nct	L3リールガン	カーリングボム	カニタンク
cm4jxi7750012xt2fom7y4mwa	ボールドマーカーネオ	ジャンプビーコン	メガホンレーザー
cm4jxi7750013xt2ft65c6e6v	ジェットスイーパー	ラインマーカー	キューインキ
cm4jxi7750014xt2fhbibvx3a	シャープマーカー	クイックボム	カニタンク
cm4jxi7760015xt2fr9p7xcpf	96ガロン	スプリンクラー	キューインキ
cm4jxi7760016xt2f9mseqs85	プロモデラーRG	スプリンクラー	ナイスダマ
cm4jxi7760017xt2ffs1m15v1	L3リールガンD	クイックボム	ウルトラハンコ
cm4jxi7760018xt2f3no1yfha	ボトルガイザー	スプラッシュシールド	ウルトラショット
cm4jxi7760019xt2fxbdxgtdf	ジェットスイーパーカスタム	ポイズンミスト	アメフラシ
cm4jxi776001axt2fsp687ajm	プライムシューターコラボ	キューバンボム	ナイスダマ
cm4jxi776001bxt2f43wkaljq	シャープマーカーネオ	キューバンボム	トリプルトルネード
cm4jxi776001cxt2f8djpa7yf	96ガロンデコ	スプラッシュシールド	テイオウイカ
cm4jxi776001dxt2f11wgvlgv	H3リールガン	ポイントセンサー	エナジースタンド
cm4jxi776001ext2fu6u11d2c	H3リールガンD	スプラッシュシールド	グレートバリア
cm4jxi776001fxt2fcd2wd9gf	ヒーローシューターレプリカ	キューバンボム	ウルトラショット
cm4jxi776001gxt2fxuv5klf3	スプラローラー	カーリングボム	グレートバリア
cm4jxi776001hxt2fk0jlqhkf	カーボンローラー	ロボットボム	ショクワンダー
cm4jxi776001ixt2fdpn5auzg	スプラローラーコラボ	ジャンプビーコン	テイオウイカ
cm4jxi776001jxt2f46nj1r2a	ダイナモローラー	スプリンクラー	エナジースタンド
cm4jxi776001kxt2frh1v43y5	ワイドローラー	スプラッシュシールド	キューインキ
cm4jxi776001lxt2fr6qxq0u5	ワイドローラーコラボ	ラインマーカー	アメフラシ
cm4jxi776001mxt2f4dya8qda	ヴァリアブルローラー	トラップ	マルチミサイル
cm4jxi776001nxt2f84c1umlo	カーボンローラーデコ	クイックボム	ウルトラショット
cm4jxi776001oxt2f5bsif3ro	スプラチャージャー	スプラッシュボム	キューインキ
cm4jxi776001pxt2f0fwun6nj	スクイックリンα	ポイントセンサー	グレートバリア
cm4jxi776001qxt2fh68vxjh4	スプラチャージャーコラボ	スプラッシュシールド	トリプルトルネード
cm4jxi776001rxt2fa5w5zbxy	スプラスコープ	スプラッシュボム	キューインキ
cm4jxi776001sxt2f8cb357zc	R-PEN/5H	スプリンクラー	エナジースタンド
cm4jxi776001txt2fp8jzca2j	リッター4K	トラップ	ホップソナー
cm4jxi776001uxt2ftydudffq	スプラスコープコラボ	スプラッシュシールド	トリプルトルネード
cm4jxi776001vxt2fea5ov7t1	14式竹筒銃・甲	ロボットボム	メガホンレーザー
cm4jxi776001wxt2fp7u2mys5	ソイチューバー	トーピード	マルチミサイル
cm4jxi776001xxt2fcbljx2ap	4Kスコープ	トラップ	ホップソナー
cm4jxi777001yxt2fyi9milzt	バケットスロッシャー	スプラッシュボム	トリプルトルネード
cm4jxi777001zxt2fjm6livmm	ヒッセン	ポイズンミスト	ジェットパック
cm4jxi7770020xt2f32q796k8	バケットスロッシャーデコ	ラインマーカー	ショクワンダー
cm4jxi7770021xt2fqjzrt4us	スクリュースロッシャー	タンサンボム	ナイスダマ
cm4jxi7770022xt2fhno7lba5	ヒッセンヒュー	タンサンボム	エナジースタンド
cm4jxi7770023xt2fv8zv5u0i	オーバーフロッシャー	スプリンクラー	アメフラシ
cm4jxi7770024xt2ficf8kw2o	エクスプロッシャー	ポイントセンサー	アメフラシ
cm4jxi7770025xt2fmrp6tvh6	バレルスピナー	スプリンクラー	ホップソナー
cm4jxi7770026xt2f1d246vvx	スプラスピナー	クイックボム	ウルトラハンコ
cm4jxi7770027xt2ftusvxqon	バレルスピナーデコ	ポイントセンサー	テイオウイカ
cm4jxi7770028xt2f9mi7z23n	ハイドラント	ロボットボム	ナイスダマ
cm4jxi7770029xt2fabl5d737	スプラスピナーコラボ	ポイズンミスト	グレードバリア
cm4jxi777002axt2flp6qs8ci	ノーチラス47	ポイントセンサー	アメフラシ
cm4jxi777002bxt2fz20d0mki	クーゲルシュライバー	タンサンボム	ジェットパック
cm4jxi777002cxt2fko3a496r	スプラマニューバー	キューバンボム	カニタンク
cm4jxi777002dxt2fpam9fo9z	デュアルスイーパー	スプラッシュボム	ホップソナー
cm4jxi777002ext2f5chco17u	スパッタリー	ジャンプビーコン	エナジースタンド
cm4jxi777002fxt2f8hcacygr	デュアルスイーパーカスタム	ジャンプビーコン	デコイチラシ
cm4jxi777002gxt2f34e31clm	クアッドホッパーブラック	ロボットボム	サメライド
cm4jxi777002hxt2f0stp6pmr	ケルビン525	スプラッシュシールド	ナイスダマ
cm4jxi777002ixt2fcdm6d21o	クアッドホッパーホワイト	スプリンクラー	ショクワンダー
cm4jxi777002jxt2fo4y2uo5k	スパッタリーヒュー	トーピード	サメライド
cm4jxi778002kxt2foh2oe4s0	パラシェルター	スプリンクラー	トリプルトルネード
cm4jxi778002lxt2fulfk7xt8	キャンピングシェルター	ジャンプビーコン	キューインキ
cm4jxi778002mxt2fhu0ah59n	スパイガジェット	トラップ	サメライド
cm4jxi778002nxt2f1lxeuxlf	キャンピングシェルターソレーラ	トラップ	ウルトラショット
cm4jxi778002oxt2fig92bmdb	ホットブラスター	ロボットボム	グレートバリア
cm4jxi778002pxt2ftc9ihybd	ラピッドブラスター	トラップ	トリプルトルネード
cm4jxi778002qxt2favib2f5l	ラピッドブラスターデコ	トーピード	ジェットパック
cm4jxi778002rxt2fd70vflo2	ロングブラスター	キューバンボム	ホップソナー
cm4jxi778002sxt2frpfk3nwb	ノヴァブラスター	スプラッシュボム	ショクワンダー
cm4jxi778002txt2fxdo2w3no	S-BLAST92	スプリンクラー	サメライド
cm4jxi778002uxt2fofvxq533	クラッシュブラスター	スプラッシュボム	ウルトラショット
cm4jxi778002vxt2fh52mpasj	ノヴァブラスターネオ	タンサンボム	ウルトラハンコ
cm4jxi778002wxt2fj3whm2ul	クラッシュブラスターネオ	カーリングボム	デコイチラシ
cm4jxi778002xxt2fqst9eons	Rブラスターエリート	ポイズンミスト	キューインキ
cm4jxi778002yxt2full6od7t	Rブラスターエリートデコ	ラインマーカー	メガホンレーザー
cm4jxi778002zxt2f89rwdsa7	ホクサイ	キューバンボム	ショクワンダー
cm4jxi7780030xt2fbqr8x8bd	パブロ	スプラッシュボム	メガホンレーザー
cm4jxi7780031xt2fvtzgcxto	フィンセント	カーリングボム	ホップソナー
cm4jxi7780032xt2ffzh7muhi	パブロヒュー	トラップ	ウルトラハンコ
cm4jxi7780033xt2fihf56c6a	トライストリンガー	ポイズンミスト	メガホンレーザー
cm4jxi7780034xt2fkpan6afz	LACT-450	カーリングボム	マルチミサイル
cm4jxi7780035xt2fqp3vsdwo	ドライブワイパー	トーピード	ウルトラハンコ
cm4jxi7780036xt2foy1c9zux	ドライブワイパーデコ	ジャンプビーコン	マルチミサイル
cm4jxi7780037xt2frqyat6j5	ジムワイパー	クイックボム	ショクワンダー
cm4jxi7780038xt2fmfshe71t	モップリン	キューバンボム	サメライド
cm4jxi7780039xt2fepzbb1hn	イグザミナー	カーリングボム	エナジースタンド
cm4jxi778003axt2f2rb9yvg3	ダイナモローラーテスラ	スプラッシュボム	デコイチラシ
cm4jxi778003bxt2f11vrap4y	ホクサイ・ヒュー	ジャンプビーコン	アメフラシ
cm4jxi778003cxt2f98ou9mqt	ソイチューバーカスタム	タンサンボム	ウルトラハンコ
cm4jxi779003dxt2fkb1bvjgi	スクリュースロッシャー	ポイントセンサー	ウルトラショット
cm4jxi779003ext2fhb6npb87	オーバーフロッシャーデコ	ラインマーカー	テイオウイカ
cm4jxi779003fxt2fkzyng83w	クーゲルシュライバー・ヒュー	トラップ	キューインキ
cm4jxi779003gxt2frbum1cae	パラシェルターソレーラ	ロボットボム	ジェットパック
cm4jxi779003hxt2f5a74exgc	トライストリンガーコラボ	スプリンクラー	デコイチラシ
cm4jxi779003ixt2fptcq3ibo	R-PEN/5B	スプラッシュシールド	アメフラシ
cm4jxi779003jxt2f2oaf9s3w	フィンセント・ヒュー	ポイントセンサー	マルチミサイル
cm4jxi779003kxt2feira6mfc	ボトルガイザーフォイル	ロボットボム	スミナガシート
cm4jxi779003lxt2f3i93045l	スパイガジェットソレーラ	トーピード	スミナガシート
cm4jxi779003mxt2f8c30zftc	LACT-450デコ	スプラッシュシールド	サメライド
cm4jxi779003nxt2ffhzonsib	S-BLAST91	クイックボム	ナイスダマ
cm4jxi779003oxt2fyktunrhe	ジムワイバー・ヒュー	ポイズンミスト	カニタンク
cm4jxi779003pxt2fjdc2l7rn	スプラマニューバーコラボ	カーリングボム	ウルトラチャクチ
cm4jxi779003qxt2f8lf1c2k5	ホットブラスターカスタム	ポイントセンサー	ウルトラチャクチ
cm4jxi779003rxt2fkpd4xyrt	24式張替傘・���	ラインマーカー	グレートバリア
cm4jxi779003sxt2fzm7fbvji	ガエンFF	トラップ	メガホンレーザー
cm4jxi779003txt2fjrd86sku	.52ガロンデコ	カーリングボム	スミナガシート
cm4jxi779003uxt2f8ons52jz	ケルビン525デコ	ポイントセンサー	ウルトラショット
cm4jxi779003vxt2fce82bafr	スクイックリンβ	ロボットボム	ショクワンダー
cm4jxi779003wxt2fqs540zfe	モップリンD	ジャンプビーコン	ホッピングソナー
cm4jxi779003xxt2fsawly9gj	ヴァリアブルローラーフォイル	キューバンボム	スミナガシート
cm4jxi779003yxt2fkvkvjjcd	ノーチラス79	キューバンボム	ウルトラチャクチ
cm4jxi779003zxt2fjdt2cymc	リッター4Kカスタム	ジャンプビーコン	テイオウイカ
cm4jxi7790040xt2f7ajd6ma3	4Kスコープカスタム	ジャンプビーコン	テイオウイカ
cm4jxi7790041xt2fbrp6fdsd	エクスプロッシャーカスタム	スプラッシュシールド	ウルトラチャクチ
cm4jxi7790042xt2fzcpopg4u	オーダーマニューバーレプリカ	キューバンボム	カニタンク
cm4jxi7790043xt2fsp32vgm9	オーダーシェルターレプリカ	スプリンクラー	トリプルトルネード
cm4jxi7790044xt2foz7kabhj	オーダーシューターレプリカ	キューバンボム	ウルトラショット
cm4jxi7790045xt2f0f9st8yo	オーダーローラーレプリカ	カーリングボム	グレートバリア
cm4jxi7790046xt2fh3mwqprg	オーダーチャージャーレプリカ	スプラッシュボム	キューインキ
cm4jxi7790047xt2faw2b0vaq	オーダーストリンガーレプリカ	ポイズンミスト	メガホンレーザー5.1ch
cm4jxi7790048xt2fwx1suaix	オーダーワイパーレプリカ	クイックボム	ショクワンダー
cm4jxi7790049xt2ffa0os8h1	オーダースロッシャーレプリカ	スプラッシュボム	トリプルトルネード
cm4jxi779004axt2fxfq22mji	オーダーブラスターレプリカ	スプラッシュボム	ショクワンダー
cm4jxi779004bxt2fo4linugc	オーダーブラシレプリカ	キューバンボム	ショクワンダー
cm4jxi779004cxt2fmle31rpr	オーダースピナーレプリカ	スプリンクラー	ホップソナー
cm4jxi779004dxt2f4uwgkdvp	オクタシューターレプリカ	スプラッシュボム	トリプルトルネード
cm4jxi77a004ext2fk2s39pka	ロングブラスターカスタム	スプラッシュボム	テイオウイカ
cm4jxi77a004fxt2fimm8ce1g	14式竹筒・乙	タンサンボム	デコイチラシ
cm4jxi77a004gxt2f579324iy	ハイドラントカスタム	トラップ	スミナガシート
cm4jxi77a004hxt2f9fqygva5	イグザミナー・ヒュー	スプラッシュボム	カニタンク
cm4jxi77a004ixt2f4qnar4ol	ガエンFFカスタム	クイックボム	トリプルトルネード
cm4jxi77a004jxt2fuk21puvx	24式張替傘・乙	ポイズンミスト	ウルトラチャクチ
cm4jxi77a004kxt2fbz34w5w4	フルイドV	ロボットボム	ウルトラハンコ
cm4jxi77a004lxt2fbxn2wef4	フルイドVカスタム	ポイントセンサー	ホップソナー
cm4jxi77a004mxt2fgsusj1a1	デンタルワイパーミント	キューバンボム	グレートバリア
cm4jxi77a004nxt2fiylym5t7	デンタルワイパースミ	スプラッシュシールド	ジェットパック
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b80f8af8-d1e1-425d-bc33-c8b3b822717b	56a97a8eb2cd7a24d8f0164c68ef684cd5ae880c272cede98be38eb6a567050d	2024-12-08 04:42:40.75331+00	20241208044240_init_tables	\N	\N	2024-12-08 04:42:40.72732+00	1
bec06bcd-727e-47fc-8394-41ea90ae8851	acbeddaebbe26c6e681502b6567fc906931b8710d19b29c14d561cccd0c0e1f8	2024-12-08 05:56:49.939399+00	20241208055649_add_condition_nullable	\N	\N	2024-12-08 05:56:49.923858+00	1
\.


--
-- Name: Analysis Analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Analysis"
    ADD CONSTRAINT "Analysis_pkey" PRIMARY KEY (id);


--
-- Name: Rule Rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rule"
    ADD CONSTRAINT "Rule_pkey" PRIMARY KEY (id);


--
-- Name: Stage Stage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Stage"
    ADD CONSTRAINT "Stage_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Weapon Weapon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Weapon"
    ADD CONSTRAINT "Weapon_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: User_mailAddress_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_mailAddress_key" ON public."User" USING btree ("mailAddress");


--
-- PostgreSQL database dump complete
--

