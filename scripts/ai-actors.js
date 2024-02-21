class aiActors {
    static ID = 'ai-actors';

    static TEMPLATES = {
        AIACTORS: `modules/${this.ID}/templates/ai-actors.hbs`,
        AIGEN: `modules/${this.ID}/templates/ai-gen.hbs`
    }

    /**
     * A small helper function which leverages developer mode flags to gate debug logs.
     * 
     * @param {boolean} force - forces the log even if the debug flag is not on
     * @param  {...any} args - what to log
     */
    static log(force, ...args) {  
        const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);
    
        if (shouldLog) {
            console.log(this.ID, '|', ...args);
        }
    }
    static initialize() {
        this.aiActorsConfig = new aiActorConfig();
    }
}

class aiActor {
    async createAiActor(aiActor) {
        let newActor = await Actor.create({
            name: "New Test Actor",
            type: "npc",
            img: "icons/svg/mystery-man.svg"
        });

        return newActor;
    }

    static getLastUpdate() {
        return this.lastUpdate;
    }

    static setLastUpdate(lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    static setNPC(object) {
        this.npc = object;
        this.errors = {};
    }

    static setBonus(object) {
        this.bonus = object;
        this.errors = {};
    }

    static setDescription(object) {
        this.description = object;
    }

    static setImg(src) {
        this.imgSrc = src;
    }

    static callLlmLib(message) {
        return llmLib.callLlm(message);
    }

    // TODO: Maybe delete this? Maybe it's useful?
    static findString(message, regex, index=1) {
        let match = message.match(new RegExp(regex, "ig"));
        if(match.length > 0) {
            return match[0].match(new RegExp(regex, "i"))[index];
        }
        else {
            return "missing";
        }
    }

    static getArrayString(array) {
        let string = "";
        for(let i=0; i<array.length; i++) {
            string += array[i];
            if(i != array.length - 1) {
                string += ", ";
            }
        }
        return string;
    }

    static getObjectString(object) {
        let string = "";
        for(const key in object) {
            if(object[key] != 0) {
                let name = key.replace(" ", "_");
                let attribute = game.i18n.localize(`AI-ACTOR.character_sheet.${name}`);
                string += "<strong>" + attribute + ":</strong> " + object[key] + "<br>";
            }
        }
        return string;
    }

    static getProficiency(attribute, type="") {
        switch(attribute) {
            case '0.5': {
                return '<i class="fa-solid fa-circle-half-stroke"></i>';
            }
            case '1': {
                return '<i class="fa-solid fa-check"></i>';
            }
            case '2': {
                return '<i class="fa-solid fa-check-double"></i>';
            }
            default:
                if(type == "skill") {
                    return '';
                }
                return '<i class="fa-regular fa-circle"></i>';
        }
    }

    static makePretty(ai_object) {
        if(ai_object[0].name == undefined) {
            return this.errorMessage("Error: JSON file not valid. Please try again.");
        }
        /* Localization Strings */
        let ac = game.i18n.localize('AI-ACTOR.character_sheet.armor_class');
        let hp = game.i18n.localize('AI-ACTOR.character_sheet.hit_points');
        let lang = game.i18n.localize('AI-ACTOR.character_sheet.languages');
        let cr = game.i18n.localize('AI-ACTOR.character_sheet.cr');
        let damage_immunities = game.i18n.localize('AI-ACTOR.character_sheet.damage_immunities');
        let damage_resistances = game.i18n.localize('AI-ACTOR.character_sheet.damage_resistances');
        let damage_vulnerabilities = game.i18n.localize('AI-ACTOR.character_sheet.damage_vulnerabilities');
        let condition_immunities = game.i18n.localize('AI-ACTOR.character_sheet.condition_immunities');
        let items = game.i18n.localize('AI-ACTOR.character_sheet.items');
        let desc = game.i18n.localize('AI-ACTOR.character_sheet.description');
        let act = game.i18n.localize('AI-ACTOR.character_sheet.actions');
        let armor = game.i18n.localize('AI-ACTOR.character_sheet.armor');
        let spells = game.i18n.localize('AI-ACTOR.character_sheet.spells');
        let cantrips = game.i18n.localize('AI-ACTOR.character_sheet.cantrips');
        let level = game.i18n.localize('AI-ACTOR.character_sheet.level');
        let biography = game.i18n.localize('AI-ACTOR.character_sheet.biography');

        // These are dynamic elements that may be used in an actor
        let senses = "", languages = "", ci = "", di = "", dr = "", dv = "", movement = "", actions = "", size, description= "", skills = [], skillStr = "", armor_class;
        armor_class = this.getObjectString(ai_object[0]?.system?.attributes?.ac);

        let str_prof = this.getProficiency(ai_object[0]?.system?.abilities?.str?.proficient);
        let dex_prof = this.getProficiency(ai_object[0]?.system?.abilities?.dex?.proficient);
        let con_prof = this.getProficiency(ai_object[0]?.system?.abilities?.con?.proficient);
        let int_prof = this.getProficiency(ai_object[0]?.system?.abilities?.int?.proficient);
        let wis_prof = this.getProficiency(ai_object[0]?.system?.abilities?.wis?.proficient);
        let cha_prof = this.getProficiency(ai_object[0]?.system?.abilities?.cha?.proficient);

        skills.push({"acrobatics": this.getProficiency(ai_object[0]?.system?.skills?.acr?.value, "skill")});
        skills.push({"animal_handling": this.getProficiency(ai_object[0]?.system?.skills?.ani?.value, "skill")});
        skills.push({"arcana": this.getProficiency(ai_object[0]?.system?.skills?.arc?.value, "skill")});
        skills.push({"athletics": this.getProficiency(ai_object[0]?.system?.skills?.ath?.value, "skill")});
        skills.push({"deception": this.getProficiency(ai_object[0]?.system?.skills?.dec?.value, "skill")});
        skills.push({"history": this.getProficiency(ai_object[0]?.system?.skills?.his?.value, "skill")});
        skills.push({"insight": this.getProficiency(ai_object[0]?.system?.skills?.ins?.value, "skill")});
        skills.push({"investigation": this.getProficiency(ai_object[0]?.system?.skills?.inv?.value, "skill")});
        skills.push({"intimidation": this.getProficiency(ai_object[0]?.system?.skills?.itm?.value, "skill")});
        skills.push({"medicine": this.getProficiency(ai_object[0]?.system?.skills?.med?.value, "skill")});
        skills.push({"nature": this.getProficiency(ai_object[0]?.system?.skills?.nat?.value, "skill")});
        skills.push({"persuasion": this.getProficiency(ai_object[0]?.system?.skills?.per?.value, "skill")});
        skills.push({"perception": this.getProficiency(ai_object[0]?.system?.skills?.prc?.value, "skill")});
        skills.push({"performance": this.getProficiency(ai_object[0]?.system?.skills?.prf?.value, "skill")});
        skills.push({"religion": this.getProficiency(ai_object[0]?.system?.skills?.rel?.value, "skill")});
        skills.push({"sleight_of_hand": this.getProficiency(ai_object[0]?.system?.skills?.slt?.value, "skill")});
        skills.push({"stealth": this.getProficiency(ai_object[0]?.system?.skills?.ste?.value, "skill")});
        skills.push({"survival": this.getProficiency(ai_object[0]?.system?.skills?.sur?.value, "skill")});

        skills.forEach(attribute => {
            skillStr += this.getObjectString(attribute);
        })

        // These values could be undefined
        if(!!ai_object[0]?.system?.attributes?.senses)
        {
            senses = this.getObjectString(ai_object[0].system.attributes.senses);
        }

        if(!!ai_object[0]?.system?.traits?.ci?.value)
        {
            ci = this.getArrayString(ai_object[0].system.traits.ci.value);
        }

        if(!!ai_object[0]?.system?.traits?.languages?.value) {
            languages = this.getArrayString(ai_object[0].system.traits.languages.value);
        }

        if(!!ai_object[0]?.system?.traits?.di?.value) {
            di = this.getArrayString(ai_object[0].system.traits.di.value);
        }

        if(!!ai_object[0]?.system?.traits?.dr?.value) {
            dr = this.getArrayString(ai_object[0].system.traits.dr.value);
        }
        
        if(!!ai_object[0]?.system?.traits?.dv?.value) {
            dv = this.getArrayString(ai_object[0].system.traits.dv.value);
        }

        if(!!ai_object[0]?.system?.attributes?.movement) {
            movement = this.getObjectString(ai_object[0].system.attributes.movement);
        }
        if(!!ai_object[2]) {
            description = ai_object[2];
        }

        for(let key in ai_object[0].system?.skills) {
            skills;
        }

        /* Items, Actions, Spells, Armor */
        for(let key in ai_object[1].bonus) {
            switch(key) {
                case 'items':
                    actions += `<p><strong>${ items }</strong></p>`;
                    if(Array.isArray(ai_object[1].bonus[key])) {
                        for(let element in ai_object[1].bonus[key]) {
                            actions += this.getObjectString(ai_object[1].bonus[key][element]) + "<br>";
                        }
                    }
                    else {
                        actions += this.getObjectString(ai_object[1].bonus[key]) + "<br>";
                    }
                    break;
                
                case 'actions':
                    actions += `<p><strong>${ act }</strong></p>`;
                    if(Array.isArray(ai_object[1].bonus[key])) {
                        for(let element in ai_object[1].bonus[key]) {
                            actions += this.getObjectString(ai_object[1].bonus[key][element]) + "<br>";
                        }
                    }
                    else {
                        actions += this.getObjectString(ai_object[1].bonus[key]) + "<br>";
                    }
                    break;

                case 'spells':
                    actions += `<p><strong>${ spells }</strong></p>`;
                    for(let spellLevel in ai_object[1].bonus[key]) {
                        switch(spellLevel) {
                            case '0':
                                actions += `<p><strong>${ cantrips }</strong></p>`;
                                for(let spell in ai_object[1].bonus[key][spellLevel]) {
                                    actions += ai_object[1].bonus[key][spellLevel][spell] + ", ";
                                }
                                break;
                            default:
                                actions += `<p><strong>${ level } ${ spellLevel }</strong></p>`;
                                for(let spell in ai_object[1].bonus[key][spellLevel]) {
                                    actions += ai_object[1].bonus[key][spellLevel][spell] + ", ";
                                }
                                break;
                        }
                        actions += "<br>";
                    }
                    break;

                case 'armor':
                    actions += `<p><strong>${ armor }</strong></p>`;
                    if(Array.isArray(ai_object[1].bonus[key])) {
                        for(let element in ai_object[1].bonus[key]) {
                            actions += this.getObjectString(ai_object[1].bonus[key][element]) + "<br>";
                        }
                    }
                    else {
                        actions += this.getObjectString(ai_object[1].bonus[key]) + "<br>";
                    }
                    break;
                    
                default:
                    break;
            }
            actions += "<br>";
        }

        switch(ai_object[0]?.system?.traits?.size) {
            case 'tiny':
                size = "Tiny";
                break;
            case 'sm':
                size = 'Small';
                break;
            case 'med':
                size = 'Medium';
                break;
            case 'lg':
                size = 'Large';
                break;
            case 'huge':
                size = 'Huge';
                break;
            case 'grg':
                size = 'Gargantuan';
                break;
            default:
                size = ai_object[0]?.system?.traits?.size;
                break;
        }

        /* TODO: Localization */
        let html = ``;
        html += `<h1>${ ai_object[0].name }</h1>`;
        html += `<p><i>${ size } ${ ai_object[0]?.system?.details?.type?.value }, ${ ai_object[0]?.system?.details?.alignment }</i> </p>`;
        html += `<hr>`;
        html += `<p><strong>${ ac }:</strong> ${ armor_class }</p>`;
        html += `<p><strong>${ hp }:</strong><br> ${ ai_object[0]?.system?.attributes?.hp?.value } (${ ai_object[0]?.system?.attributes?.hp?.formula })</p>`;
        html += `<p>${ movement }</p>`;
        html += `<hr>`;
        html += `
        <div class="ability-block">
            <div class="ability-block block">
                <div class="sm-block">STR</div>
                <div class="">${ai_object[0]?.system?.abilities?.str?.value}</div>
                <div class="">${str_prof}</div>
            </div>
            <div class="ability-block block">
                <div class="sm-block">DEX</div>
                <div>${ai_object[0]?.system?.abilities?.dex?.value}</div>
                <div class="">${dex_prof}</div>
            </div>
            <div class="ability-block block">
                <div class="sm-block">CON</div>
                <div>${ai_object[0]?.system?.abilities?.con?.value}</div>
                <div class="">${con_prof}</div>
            </div>
            <div class="ability-block block">
                <div class="sm-block">INT</div>
                <div>${ai_object[0]?.system?.abilities?.int?.value}</div>
                <div class="">${int_prof}</div>
            </div>
            <div class="ability-block block">
                <div class="sm-block">WIS</div>
                <div>${ai_object[0]?.system?.abilities?.wis?.value}</div>
                <div class="">${wis_prof}</div>
            </div>
            <div class="ability-block block">
                <div class="sm-block">CHA</div>
                <div>${ai_object[0]?.system?.abilities?.cha?.value}</div>
                <div class="">${cha_prof}</div>
            </div>
        </div>
        <hr>
        `;
        html += `${ skillStr }`;
        html += `<p>${ senses }</p>`;
        html += `<p><strong>${ lang }:</strong> ${ languages }\n</p>`;
        html += `<p><strong>${ cr }:</strong> ${ ai_object[0]?.system?.details?.cr }\n</p>`;
        if(di) {
            html += `<p><strong>${ damage_immunities }:</strong> ${ di }</p>`;
        }
        if(dr) {
            html += `<p><strong>${ damage_resistances }:</strong> ${ dr }</p>`;
        }
        if(dv) {
            html += `<p><strong>${ damage_vulnerabilities }:</strong> ${ dv }</p>`;
        }
        if(ci) {
            html += `<p><strong>${ condition_immunities }:</strong> ${ ci }</p>`;
        }
        html += `
        <h2 class="actions">Actions</h2>
        <i>Due to the nature of AI, these may not be exactly the items created since they may or may not exist.</i>
        `;
        html += `<p>${ actions }</p>`;
        html += `<p><strong>${ biography }:</strong> ${ai_object[0]?.system?.details?.biography?.value}\n<br></p>`;
        html += `
        <p><strong>${ desc }:</strong></p>
        ${description}`;
        return html;
    }

    static async getItemList(array) {
        let actionsItemsList = [];
        let itemsPack = game.packs.get("dnd5e.items");
        let monsterFeaturePack = game.packs.get("dnd5e.monsterfeatures");
        let classFeaturePack = game.packs.get("dnd5e.classfeatures");

        if(Array.isArray(array)) {
            // Get items that are close to what the AI gives you
            for(let i in array) {
                if(!!array[i]?.name) {
                    let words = (array[i]?.name).split(" ");
                    let foundItems = [];
                    let unFoundItems = [];
                    // Split the words to look at individually
                    words.forEach((word) => {
                        let wordItems = itemsPack.search({query: word});
                        let wordMonsterFeature = monsterFeaturePack.search({query: word});
                        let wordClassFeature = classFeaturePack.search({query: word});
    
                        let exactMatch = wordItems.find(wi => wi.name == word);
                        let exactMFMatch = wordMonsterFeature.find(wmf => wmf.name == word);
                        let exactCFMatch = wordClassFeature.find(wcf => wcf.name == word);
                        // If it finds an exact match, add it to our items 
                        if(!!exactMatch) {
                            wordItems = [exactMatch];
                        }
                        if(!!exactMFMatch) {
                            wordMonsterFeature = [wordMonsterFeature];
                        }
                        if(!!exactCFMatch) {
                            wordClassFeature = [wordClassFeature];
                        }
                        // Add what we've got to foundItems
                        foundItems = foundItems.concat(wordItems);
                        foundItems = foundItems.concat(wordMonsterFeature);
                        foundItems = foundItems.concat(wordClassFeature);
                    })
    
                    foundItems = foundItems.concat(itemsPack.search({ query: array[i].name }));
                    foundItems = foundItems.concat(monsterFeaturePack.search({query: array[i].name}));
                    foundItems = foundItems.concat(classFeaturePack.search({query: array[i].name}));
    
                    // Find exact match for both/all words?
                    let exactMatch = foundItems.find(i => i.name == array[i]?.name);
                    if(!!exactMatch) {
                        foundItems = exactMatch;
                    }
                    // If there is more than one item in the list, run through the levenschtein algorithm to find the best match
                    if(foundItems.length > 1) {
                        let min = 10000;
                        let bestMatch = null;
    
                        foundItems.forEach((item) => {
                            let distance = this.levenshtein(item.name, array[i].name);
                            if(distance < min) {
                                min = distance;
                                bestMatch = item;
                                console.log(min + " " + bestMatch.name);
                            }
                        })
                        foundItems = [bestMatch];
                    }
    
                    // If there is something in foundItems, put it in actionsItemsList
                    if(foundItems.length != 0) {
                        actionsItemsList.push(foundItems);
                    }
                    // If there is nothing, run the Levenschtein algorithm on entire compendium to find close match
                    else {
                        // TODO: Do Levenschtein on entire compendium when we have no matches
                        let item = array[i];
                        let newItem = await this.createItem(item);
                        actionsItemsList.push([newItem]);
                    }
    
                }
            }
        }
        else {
            if(!!array?.name) {
                let words = (array?.name).split(" ");
                let foundItems = [];
                let unFoundItems = [];
                // Split the words to look at individually
                words.forEach((word) => {
                    let wordItems = itemsPack.search({query: word});
                    let wordMonsterFeature = monsterFeaturePack.search({query: word});
                    let wordClassFeature = classFeaturePack.search({query: word});

                    let exactMatch = wordItems.find(wi => wi.name == word);
                    let exactMFMatch = wordMonsterFeature.find(wmf => wmf.name == word);
                    let exactCFMatch = wordClassFeature.find(wcf => wcf.name == word);
                    // If it finds an exact match, add it to our items 
                    if(!!exactMatch) {
                        wordItems = [exactMatch];
                    }
                    if(!!exactMFMatch) {
                        wordMonsterFeature = [wordMonsterFeature];
                    }
                    if(!!exactCFMatch) {
                        wordClassFeature = [wordClassFeature];
                    }
                    // Add what we've got to foundItems
                    foundItems = foundItems.concat(wordItems);
                    foundItems = foundItems.concat(wordMonsterFeature);
                    foundItems = foundItems.concat(wordClassFeature);
                })

                foundItems = foundItems.concat(itemsPack.search({ query: array.name }));
                foundItems = foundItems.concat(monsterFeaturePack.search({query: array.name}));
                foundItems = foundItems.concat(classFeaturePack.search({query: array.name}));

                // Find exact match for both/all words?
                let exactMatch = foundItems.find(i => i.name == array?.name);
                if(!!exactMatch) {
                    foundItems = [exactMatch];
                }
                // If there is more than one item in the list, run through the levenschtein algorithm to find the best match
                if(foundItems.length > 1) {
                    let min = 10000;
                    let bestMatch = null;

                    foundItems.forEach((item) => {
                        let distance = this.levenshtein(item.name, array.name);
                        if(distance < min) {
                            min = distance;
                            bestMatch = item;
                            console.log(min + " " + bestMatch.name);
                        }
                    })
                    foundItems = [bestMatch];
                }

                // If there is something in foundItems, put it in actionsItemsList
                if(foundItems.length != 0) {
                    actionsItemsList.push(foundItems);
                }
                // If there is nothing, run the Levenschtein algorithm on entire compendium to find close match
                else {
                    // TODO: Do Levenschtein on entire compendium when we have no matches
                    let item = array;
                    let newItem = await this.createItem(item);
                    actionsItemsList.push([newItem]);
                }

            }
        }
        return actionsItemsList;
    }

    static async getSpellList(array) {
        let spellList = [];
        let spellsPack = game.packs.get("dnd5e.spells");

        for(let element in array) {
            array[element].forEach(async (i) => {
                let words = (i).split(" ");
                let foundItems = [];
                // Split the words to look at individually
                words.forEach((word) => {        
                    let wordItems = spellsPack.search({query: word});
                    let exactMatch = wordItems.find(wi => wi.name == word);
                    // If it finds an exact match, add it to our items 
                    if(!!exactMatch) {
                        wordItems = [exactMatch];
                    }
                    // Add what we've got to foundItems
                    foundItems = foundItems.concat(wordItems);
                })

                foundItems = foundItems.concat(spellsPack.search({ query: i }));
                // Find exact match for both/all words?
                let exactMatch = foundItems.find(j => (j.name).toLowerCase() == i.toLowerCase());
                if(!!exactMatch) {
                    foundItems = exactMatch;
                }
                // If there is more than one item in the list, run through the levenschtein algorithm to find the best match
                if(foundItems.length > 1) {
                    let min = 10000;
                    let bestMatch = null;
    
                    foundItems.forEach((item) => {
                        let distance = this.levenshtein(item, i);
                        if(distance < min) {
                            min = distance;
                            bestMatch = item;
                            console.log(min + " " + bestMatch.name);
                        }
                    })
                    foundItems = bestMatch;
                }
    
                // If there is something in foundItems, put it in actionsItemsList
                if(foundItems.length != 0) {
                    spellList.push(foundItems);
                }
                // If there is nothing, run the Levenschtein algorithm on entire compendium to find close match
                else {
                    // TODO: Do Levenschtein on entire compendium when we have no matches
                    let item = i;
                    let newItem = await this.createItem(item);
                    spellList.push([newItem]);
                }
            })
        }
        return spellList;
    }

    static async createEquipItems(list, actor) {
        list.forEach((element) => {
            element.forEach(async (i) => {
                let item = await fromUuid(i.uuid);
                // IMPORTANT this MUST be AWAITED
                await actor.createEmbeddedDocuments("Item", [item]);

                let addedItem = actor.items.find(e => e.name === i.name);
                let equipped = {
                    system: {
                        equipped: true
                    }
                }
                await addedItem.update(equipped);
            })
        })
    }

    static async saveImageToFileSystem(imageBase64, path) {

        if (!path.includes('.png')) {
            path = path + '.png';
        }
        // Convert to Blob
        const byteCharacters = atob(imageBase64);
        const byteArrays = [];

        for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
        }

        const byteArray = new Uint8Array(byteArrays);
        const myBlob = new Blob([byteArray], { type: "image/png" });

        const imageFile = new File([myBlob], path, {type: myBlob.type});
        const uploadResult = await FilePicker.upload("data", "", imageFile, {}, {notify: true});
        return uploadResult;

    }

    static removeDuplicates(data) {
        return [...new Set(data)];
    }

    static errorMessage(err) {
        const error_message = game.i18n.localize('AI-ACTOR.errors.generic');
        let ai_response = document.getElementById('ai-inner-response');
        let send_message_btn = document.getElementById('send_message_btn');
        let make_actor_btn = document.getElementById('make_ai_actor_btn');
        let loaderElement = document.getElementById('ai-loading');
        
        ai_response.innerHTML = err;
        ai_response.innerHTML += "<p>" + error_message + "</p>";
        send_message_btn.removeAttribute("disabled");
        make_actor_btn.removeAttribute("disabled");
        loaderElement.classList.remove("loader");
    }

    static clear() {
        let ai_element = document.getElementById('ai-response');
        let ai_response = document.getElementById('ai-inner-response');
        ai_element.style.display = 'flex';
        let loaderElement = document.getElementById('ai-loading');
        loaderElement.classList.add("loader");
        let imgHolder = document.getElementById('ai-img-gen');

        ai_response.innerHTML = "";
        ai_element.style.display = "block";
        loaderElement.classList.remove("loader");
        imgHolder.src = "";
    }

    static async createItem(itemData) {
        let item = {
            "name": itemData?.name,
            "system": {
                "description": {
                    "value": itemData?.description
                }
            },
            "type": itemData?.type
        }

        return await Item.create(item);
    }

    /* https://stackoverflow.com/questions/18516942/fastest-general-purpose-levenshtein-javascript-implementation */
    static levenshtein(s, t) {
        if (s === t) {
            return 0;
        }
        var n = s.length, m = t.length;
        if (n === 0 || m === 0) {
            return n + m;
        }
        var x = 0, y, a, b, c, d, g, h, k;
        var p = new Array(n);
        for (y = 0; y < n;) {
            p[y] = ++y;
        }
    
        for (; (x + 3) < m; x += 4) {
            var e1 = t.charCodeAt(x);
            var e2 = t.charCodeAt(x + 1);
            var e3 = t.charCodeAt(x + 2);
            var e4 = t.charCodeAt(x + 3);
            c = x;
            b = x + 1;
            d = x + 2;
            g = x + 3;
            h = x + 4;
            for (y = 0; y < n; y++) {
                k = s.charCodeAt(y);
                a = p[y];
                if (a < c || b < c) {
                    c = (a > b ? b + 1 : a + 1);
                }
                else {
                    if (e1 !== k) {
                        c++;
                    }
                }
    
                if (c < b || d < b) {
                    b = (c > d ? d + 1 : c + 1);
                }
                else {
                    if (e2 !== k) {
                        b++;
                    }
                }
    
                if (b < d || g < d) {
                    d = (b > g ? g + 1 : b + 1);
                }
                else {
                    if (e3 !== k) {
                        d++;
                    }
                }
    
                if (d < g || h < g) {
                    g = (d > h ? h + 1 : d + 1);
                }
                else {
                    if (e4 !== k) {
                        g++;
                    }
                }
                p[y] = h = g;
                g = d;
                d = b;
                b = c;
                c = a;
            }
        }
    
        for (; x < m;) {
            var e = t.charCodeAt(x);
            c = x;
            d = ++x;
            for (y = 0; y < n; y++) {
                a = p[y];
                if (a < c || d < c) {
                    d = (a > d ? d + 1 : a + 1);
                }
                else {
                    if (e !== s.charCodeAt(y)) {
                        d = c + 1;
                    }
                    else {
                        d = c;
                    }
                }
                p[y] = d;
                c = a;
            }
            h = d;
        }
    
        return h;
    }

}


/**
 * Register our module's debug flag with developer mode's custom hook
 */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(aiActors.ID);
});

/* FormApplication for ai actors */
class aiActorConfig extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;
        const title = game.i18n.localize('AI-ACTOR.generate_actor');
      
        const overrides = {
            // height: 'auto',
            width: '442',
            id: 'ai-actors',
            template: aiActors.TEMPLATES.AIACTORS,
            title: title,
            userId: game.userId,
            resizable: true,
            //closeOnSubmit: false, // do not close when submitted
            //submitOnChange: true, // submit when any input changes
        };
      
        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        
        return mergedOptions;
    }

    async _updateObject(event, formData) {
        // aiActors.log(formData);
    }

    activateListeners(html) {
        super.activateListeners(html);
  
        html.on('click', "[data-action]", this._handleButtonClick.bind(this));
    }

    async _handleButtonClick(event) {
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;

        // Which button was clicked
        switch (action) {

            /* SEND MESSAGE */ 
            case 'send_message': {
                aiActor.clear();
                /* Set HTML Elements */
                const IMG_GEN_SETTING = game.settings.get(`${aiActorSettings.ID}`, `${aiActorSettings.SETTINGS.IMAGE_GEN}`);
                let ai_element = document.getElementById('ai-response');
                let ai_response = document.getElementById('ai-inner-response');
                ai_element.style.display = 'flex';
                let loaderElement = document.getElementById('ai-loading');
                loaderElement.classList.add("loader");
                let img_div = document.getElementById('ai-img');
                let imgHolder = document.getElementById('ai-img-gen');
                let send_message_btn = document.getElementById('send_message_btn');
                let make_actor_btn = document.getElementById('make_ai_actor_btn');
                let regenerate_img = document.getElementById('regenerate_img')
                let imgDesc = "";
                let html = "";

                /* Localization variables */
                const generating_character = game.i18n.localize('AI-ACTOR.generating_character');
                const generating_image = game.i18n.localize('AI-ACTOR.generating_image');

                /* Get User Input */
                let userMessage = document.getElementById('user-input').value;
                send_message_btn.setAttribute("disabled", "disabled");
                make_actor_btn.setAttribute("disabled", "disabled");
                ai_response.innerHTML = "<p>" + generating_character + "</p>";

                /* If userMessage is empty */
                if(userMessage.length == 0) {
                    userMessage = 'An interesting character';
                }

                /* Call Language Model */
                let ai_object = await llmLib.callLlm(userMessage);
                // let ai_message = llmLib.callPredetermined();

                /* Set HTML elements and split the ai message */
                ai_response.innerHTML = "<p>" + generating_image + "</p>";
                // console.log(ai_message);
                // let ai_string = ai_message.split("```");
                // console.log(ai_string);

                // if(ai_string[0] == ("\n")) {
                //     // Do nothing
                // }
                // else if(!ai_string[0].toLowerCase().startsWith("jobject") || !ai_string[0].toLowerCase().startsWith("json")) {
                //     ai_string[0] = "jobject\n" + ai_string[0];
                // }

                // let ai_object = [];
                // /* Remove jobject from text, convert two JSON files into array of objects */
                // ai_string.forEach((element, index) => {
                //     if(element.toLowerCase().includes("jobject\n") || element.toLowerCase().includes('json\n')) {
                //         element = element.replace("jobject", "");
                //         element = element.replace("json", "");
                //         if(element.includes('"bonus":') && index < 2) {
                //             let jsonObjects = element.split(', \n "bonus":');

                //             jsonObjects.forEach((i) => {
                //                 i = JSON.parse(i);
                //                 ai_object.push(i);
                //             })
                //             return;
                //         }
                //         try {
                //             element = JSON.parse(element);
                //         } catch(err) {
                //             aiActor.errorMessage(err);
                //         }
                        
                //         ai_object.push(element);
                //     }
                //     else if(element.includes("jobject ") || element.includes("------------------")) {
                //         // Do nothing
                //     }
                //     else if((element.length > 3) && (index != 0)){
                //         ai_object.push(element);
                //     }
                // });
                
                console.log(ai_object);

                /* Create html to display */
                try {
                    html = aiActor.makePretty(ai_object);
                }
                catch(err) {
                    aiActor.errorMessage(err);
                }
                
                // ai_object contains two JSON objects, one with the format for creating an actor, and one for holding information on actions & items
                aiActor.setLastUpdate(ai_object);
                aiActor.setNPC(ai_object[0]);
                aiActor.setBonus(ai_object[1]);

                // Foundry uses showdown to convert markdown to html
                /* Doing my own HTML conversion right now
                let converter = new showdown.Converter();
                let newHTML = converter.makeHtml(ai_message);
                */

                /* Get the description to create an image */
                if(!!ai_object[3]) {
                    imgDesc = ai_object[3];
                }
                else if(!!ai_object[2]) {
                    imgDesc = ai_object[2];
                }
                else {
                    imgDesc = ai_object[0]?.system?.details?.biography?.value;
                }

                aiActor.setDescription(imgDesc);
                let imgGen;

                /* Call Dall-E 3 */
                if(IMG_GEN_SETTING) {
                    try {
                        imgGen = await llmLib.callDallE(imgDesc);
                    } catch(err) {
                        console.log(err);
                    }
                    // let imgGen = llmLib.callPredeterminedImg();
    
                    /* Set the image based on the description */
                    imgHolder.src = "data:image/png;base64," + imgGen;
                    aiActor.setImg(imgGen);
                }

                /* If the image doesn't generate, set it to default */
                if(imgGen == null) {
                    if(!IMG_GEN_SETTING) {
                        imgHolder.value = "Error creating image";
                        regenerate_img.style.display = "none";
                        imgHolder.style.display = "none";
                    }
                    else {
                        imgHolder.src = "icons/svg/mystery-man.svg";
                    }
                }
               
                /* Update HTML elements */
                ai_element.style.display = 'block';
                loaderElement.classList.remove("loader");
                img_div.style.display = 'block';
                loaderElement.style.display = 'none';
                ai_response.innerHTML = html;
                send_message_btn.removeAttribute("disabled");
                make_actor_btn.removeAttribute("disabled");
               
                break;
          }
          
            /* MAKE ACTOR */
            case 'make_ai_actor': {
            if(aiActor.getLastUpdate() === undefined) {
                // Don't do anything if no messages have been sent or created
                break;
            }
            else {
                /* Grab the folder to put in */
                let userSetFolder = document.getElementById('folders').value;
                let folder = game.folders.get(userSetFolder);
                /* Grab the actor variables */
                let npcActor = aiActor.npc;
                let npcBonuses = aiActor.bonus;
                let imgSrc = aiActor.imgSrc;
                let spellList = [];
                let nameString = (npcActor.name).replace(/\s+/g, '');

                npcActor.folder = folder;

                /* Save the image if it exists */
                if(imgSrc != null) {
                    let newImg = await aiActor.saveImageToFileSystem(imgSrc, nameString);
                    npcActor.img = newImg.path;
                }

                /* Create an actor */
                let newActor = await Actor.create(npcActor);
                let actor = game.actors.get(newActor.id);

                console.log(newActor);
                console.log(npcBonuses.bonus);

                /* Get items and spells lists */
                const actionsList = await aiActor.getItemList(npcBonuses.bonus.actions);
                const armorItemsList = await aiActor.getItemList(npcBonuses.bonus.armor);
                const itemsList = await aiActor.getItemList(npcBonuses.bonus.items);
                spellList = await aiActor.getSpellList(npcBonuses.bonus.spells);
                spellList = aiActor.removeDuplicates(spellList);

                /* Create, add, equip item to actor */
                aiActor.createEquipItems(actionsList, actor);
                aiActor.createEquipItems(armorItemsList, actor);
                aiActor.createEquipItems(itemsList, actor);

                /* Spells equip works a little differently */
                spellList.forEach(async (element) => {
                    let spell = await fromUuid(element.uuid);
                    await actor.createEmbeddedDocuments("Item", [spell]);
                })
                break;
            }
            
            }

            case 'regenerate_img': {
                /* Get HTML elements*/
                const imgDesc = aiActor.npc.system.description;
                let imgHolder = document.getElementById('ai-img-gen');
                let loading = document.getElementById('ai-img-loading');
                let regenImg = document.getElementById('regenerate_img');

                /* Set HTML Elements */
                regenImg.setAttribute("disabled", "disabled");
                imgHolder.style.display = 'none';
                loading.classList.add('loader');

                /* Call Dall-E 3 */
                let imgGen = await llmLib.callDallE(imgDesc);

                /* Reset HTML Elements */
                loading.classList.remove('loader');
                imgHolder.style.display = 'block';
                imgHolder.src = "data:image/png;base64," + imgGen;
                regenImg.removeAttribute("disabled");
                aiActor.setImg(imgGen);
                break;
            }
    
          default:
            aiActors.log(false, 'Invalid action detected', action);
        }
        
        aiActors.log(false, 'Button Clicked!', action);
    }
}

class aiActorSettings {
    static ID = "ai-actors";
  
    static SETTINGS = {
      IMAGE_GEN: "img_gen"
    };
  
    static TEMPLATES = {
      CHATBOT: `modules/${this.ID}/templates/${this.ID}.hbs`,
    };
  
  
    /**
     * A small helper function which leverages developer mode flags to gate debug logs.
     *
     * @param {boolean} force - forces the log even if the debug flag is not on
     * @param  {...any} args - what to log
     */
    static log(force, ...args) {
      const shouldLog =
        force ||
        game.modules.get("_dev-mode")?.api?.getPackageDebugValue(this.ID);
  
      if (shouldLog) {
        console.log(this.ID, "|", ...args);
      }
    }
  
    static initialize() {
      this.aiActorSettings = new aiActorSettings();
  
      game.settings.register(this.ID, this.SETTINGS.IMAGE_GEN, {
        name: `AI-ACTOR.settings.${this.SETTINGS.IMAGE_GEN}.Name`,
        default: true,
        type: Boolean,
        scope: "world", // or is it 'client'?
        config: true,
        hint: `AI-ACTOR.settings.${this.SETTINGS.IMAGE_GEN}.Hint`,
        onChange: () => {}, // Probably don't need this if I can just grab it from game.settings.get. Instead in future this could be a way to let me know something has changed?
        restricted: false,
      });
    }
  }

// Initialize 
Hooks.once('init', () => {
    aiActors.initialize();
    aiActorSettings.initialize();
});

Hooks.on("ready", () => {

});

Hooks.on('renderaiActorConfig', (html) => {
    let gameFolders = [];
    const folders = html.form.folders;
    const selectFolder = game.i18n.localize('AI-ACTOR.select_folder');
    folders.options.add( new Option(`-- ${selectFolder} --`, "", true, true));
    game.folders.forEach(folder => {
        if(folder.type == 'Actor') {
            let option = new Option(folder.name, folder.id);
            folders.options.add(option);
        }
    })
});

// Create AI Actor Button in Actor directory
Hooks.on('getActorDirectoryEntryContext', (html) => { 
    console.log(html);
    const directoryHeader = html.find(`[class="header-actions action-buttons flexrow"]`);

    const create_actor = game.i18n.localize('AI-ACTOR.create_actor');

    directoryHeader.append(
        `<button type='button' class='create-ai-actor-button' title='${create_actor}'><i class="fa-solid fa-hat-wizard"></i> ${create_actor}</button>`
    )

    html.on('click', '.create-ai-actor-button', (event) => {
        /*const userId = $(event.currentTarget).parents('[data-user-id]')?.data()?.userId;
        ToDoList.toDoListConfig.render(true, {userId});*/
        userId = game.userId;
        aiActors.aiActorsConfig.render(true, {userId});
    });
});

