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
        this.aiImageGenConfig = new aiImageGenConfig();

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
            let capitalized = key.charAt(0).toUpperCase() + key.slice(1);
            string += "<strong>" + capitalized + ":</strong> " + object[key] + "<br>";
        }
        return string;
    }

    static makePretty(ai_object) {
        // These are dynamic elements that may be used in an actor
        let senses = "", languages = "", ci = "", di = "", dr = "", dv = "", movement = "", actions = "", size, cr;

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

        for(let key in ai_object[1].bonus) {
            for(let item in ai_object[1].bonus[key]) {
                actions += ai_object[1].bonus[key][item] + "<br>";
            }
            actions += "<br>";
        }

        switch(ai_object[0].system.traits.size) {
            case 'tiny':
                size = "Tiny";
                break;
            case 'sm':
                size = 'Small';
                break;
            case 'med':
                size = 'Medium';
                break;
            case 'lrg':
                size = 'Large';
                break;
            case 'huge':
                size = 'Huge';
                break;
            case 'grg':
                size = 'Gargantuan';
                break;
            default:
                size = ai_object[0].system.traits.size;
                break;
        }

        /* TODO: Localization */
        let html = `
        <h1>${ ai_object[0].name }</h1>
        <p><i>${ size } ${ ai_object[0].system.details.type }, ${ ai_object[0].system.details.alignment }</i> </p>
        <hr>
        <p><strong>Armor Class:</strong> ${ai_object[0].system.attributes.ac}</p>
        <p><strong>Hit Points:</strong> ${ ai_object[0].system.attributes.hp.value } (${ ai_object[0].system.attributes.hp.formula })</p>
        <p>${ movement } </p>
        <hr>
        <div class="ability-block">
            <div class="ability-block block">
                <div class="sm-block">STR</div>
                <div class="">${ai_object[0].system.abilities.str.value}</div>
            </div>
            <div class="ability-block block">
                <div class="sm-block">DEX</div>
                <div>${ai_object[0].system.abilities.dex.value}</div>
            </div>
            <div class="ability-block block">
                <div class="sm-block">CON</div>
                <div>${ai_object[0].system.abilities.con.value}</div>
            </div>
            <div class="ability-block block">
                <div class="sm-block">INT</div>
                <div>${ai_object[0].system.abilities.int.value}</div>
            </div>
            <div class="ability-block block">
                <div class="sm-block">WIS</div>
                <div>${ai_object[0].system.abilities.wis.value}</div>
            </div>
            <div class="ability-block block">
                <div class="sm-block">CHA</div>
                <div>${ai_object[0].system.abilities.cha.value}</div>
            </div>
        </div>
        <hr>
        <p>${ senses }</p>
        <p><strong>Languages:</strong> ${ languages }\n</p>
        <p><strong>CR:</strong> ${ ai_object[0].system.details.cr }\n</p>
        <p><strong>Damage Immunities:</strong> ${ di }</p>
        <p><strong>Damage Resistances:</strong> ${ dr }</p>
        <p><strong>Damage Vulnerabilities:</strong> ${ dv }</p>
        <p><strong>Condition Immunities:</strong> ${ ci }</p>
        <h2 class="actions">Actions</h2>
        <i>Due to the nature of AI, these may not be exactly the items created since they may or may not exist.</i>
        <p>${ actions }</p>
        <p><strong>Biography:</strong> ${ai_object[0].system.details.biography.value}\n<br></p>
        `;
        return html;
    }

    static getItemList(array) {
        let actionsItemsList = [];
        let itemsPack = game.packs.get("dnd5e.items");
        let monsterFeaturePack = game.packs.get("dnd5e.monsterfeatures");
        let classFeaturePack = game.packs.get("dnd5e.classfeatures");

        // Get items that are close to what the AI gives you
        for(let i in array) {
            if(!!array[i]?.name) {
                let words = (array[i]?.name).split(" ");
                let foundItems = [];
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
                    foundItems = [exactMatch];
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
                }

            }
        }
        return actionsItemsList;
    }

    static getSpellList(array) {
        let spellList = [];
        let spellsPack = game.packs.get("dnd5e.spells");

        for(let element in array) {
            array[element].forEach((i) => {
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
                }
            })
        }
        return spellList;
    }

    static async saveImageToFileSystem(imageUrl) {
        try {
            // Step 1: Fetch the image as a Blob from the URL
            const imageResponse = await fetch(imageUrl, {mode: "no-cors", credentials: "omit" });
            if (!imageResponse.ok) throw new Error('Network response was not ok');
            const imageBlob = await imageResponse.blob();
    
            // Step 2: Convert the Blob to a File
            const imageFile = new File([imageBlob], "desiredFilename.png", {type: imageBlob.type});
    
            // Step 3: Use FilePicker.upload to save the File
            const uploadResult = await FilePicker.upload("data", "", imageFile, {}, {notify: true});
            console.log("Upload successful", uploadResult);
            return uploadResult;
        } catch (error) {
            console.error("Error fetching or uploading image:", error);
            return null;
        }

    }

    static removeDuplicates(data) {
        return [...new Set(data)];
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
      
        const overrides = {
            // height: 'auto',
            width: '442',
            id: 'ai-actors',
            template: aiActors.TEMPLATES.AIACTORS,
            title: 'Create AI Actors',
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
                let ai_element = document.getElementById('ai-response');
                ai_element.style.display = 'flex';
                let loaderElement = document.getElementById('ai-loading');
                loaderElement.classList.add("loader");
                let img_div = document.getElementById('ai-img');
                let imgHolder = document.getElementById('ai-img-gen');

                let userMessage = document.getElementById('user-input').value;
                // let ai_message = await llmLib.callLlm(userMessage);
                let ai_message = llmLib.callPredetermined();
                console.log(ai_message);
                let ai_string = ai_message.split("```");

                let ai_object = [];
                // Remove jobject from text, convert two JSON files into array of objects
                ai_string.forEach((element) => {
                    if(element.includes("jobject\n")) {
                        element = element.replace("jobject", "")
                        element = JSON.parse(element);
                        ai_object.push(element);
                    }
                    else if(element.includes("Dall-E Generation")) {
                        ai_object.push(element);
                    }
                });
                
                console.log(ai_object);
                // Create html to display
                let html = aiActor.makePretty(ai_object);

                aiActor.setLastUpdate(ai_message);
                // ai_object contains two JSON objects, one with the format for creating an actor, and one for holding information on actions & items
                aiActor.setNPC(ai_object[0]);
                aiActor.setBonus(ai_object[1]);

                // Foundry uses showdown to convert markdown to html
                /* Doing my own HTML conversion right now
                let converter = new showdown.Converter();
                let newHTML = converter.makeHtml(ai_message);
                */

               // let imgGen = 'icons/svg/mystery-man.svg';
               let imgGen = await llmLib.callDallE(ai_object[2]);
               console.log(imgGen);
               imgHolder.src = imgGen;
               aiActor.setImg(imgGen);
               
               ai_element.style.display = 'block';
               loaderElement.classList.remove("loader");
               img_div.style.display = 'block';
               loaderElement.style.display = 'none';
               ai_element.innerHTML += html;
               
                break;
          }
          
            /* MAKE ACTOR */
            case 'make_ai_actor': {
            if(aiActor.getLastUpdate() === undefined) {
                // Don't do anything if no messages have been sent or created
                break;
            }
            else {
                let npcActor = aiActor.npc;
                let npcBonuses = aiActor.bonus;
                let imgSrc = aiActor.imgSrc;
                let actionsItemsList = [];
                let spellList = [];

                let newActor = await Actor.create(npcActor);

                let actor = game.actors.get(newActor.id);

                let newImg = await aiActor.saveImageToFileSystem(imgSrc);
                console.log(newImg);

                actor.img = imgSrc;

                console.log(newActor);
                console.log(npcBonuses.bonus);

                actionsItemsList = aiActor.getItemList(npcBonuses.bonus);
                spellList = aiActor.getSpellList(npcBonuses.bonus.spells);
                spellList = aiActor.removeDuplicates(spellList);
                console.log("Spells:");
                console.log(spellList);

                // Create, add, equip item to actor
                /** TODO: Add class features */
                actionsItemsList.forEach((element) => {
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

                spellList.forEach(async (element) => {
                    let spell = await fromUuid(element.uuid);
                    await actor.createEmbeddedDocuments("Item", [spell]);

                    // Do they need to be prepared?
                    // let addedSpell = actor.items.find(e => e.name === spell.name)
                })
                break;
            }
            
            }
    
          default:
            aiActors.log(false, 'Invalid action detected', action);
        }
        
        aiActors.log(false, 'Button Clicked!', action);
    }
}

// Initialize 
Hooks.once('init', () => {
    aiActors.initialize();
});

Hooks.on("ready", () => {
    // let pack = game.packs.get("dnd5e.items");
    // // let item = pack.index.value.name("Studded Leather Armor +3");
    // console.log("ITEM:")
    // let item = pack.search({ query:"Studded Leather Armor +3"});
    // console.log(item);
    // console.log(pack);
});

// Create AI Actor Button in Actor directory
Hooks.on('getActorDirectoryEntryContext', (html) => { 
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

