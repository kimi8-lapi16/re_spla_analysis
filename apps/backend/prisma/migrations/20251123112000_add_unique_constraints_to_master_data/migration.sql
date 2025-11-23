-- CreateIndex: Add unique constraint to Stage.name
CREATE UNIQUE INDEX `stage_name_key` ON `stage`(`name`);

-- CreateIndex: Add unique constraint to Rule.name
CREATE UNIQUE INDEX `rule_name_key` ON `rule`(`name`);

-- CreateIndex: Add unique constraint to SubWeapon.name
CREATE UNIQUE INDEX `sub_weapon_name_key` ON `sub_weapon`(`name`);

-- CreateIndex: Add unique constraint to SpecialWeapon.name
CREATE UNIQUE INDEX `special_weapon_name_key` ON `special_weapon`(`name`);

-- CreateIndex: Add unique constraint to Weapon.name
CREATE UNIQUE INDEX `weapon_name_key` ON `weapon`(`name`);

-- CreateIndex: Add unique constraint to BattleType.name
CREATE UNIQUE INDEX `battle_type_name_key` ON `battle_type`(`name`);
