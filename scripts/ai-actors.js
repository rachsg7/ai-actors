class aiActors {
    static ID = 'ai-actors';

    static TEMPLATES = {
        AIACTORS: `modules/${this.ID}/templates/ai-actors.hbs`
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

    static setNPC() {
        this.npc = {};
        this.errors = {};
    }

    static callLlmLib(message) {
        return llmLib.callLlm(message);
    }

    static parseMessage(message) {
        let aiActor = {};

        aiActor.name = this.getName(message);
        aiActor.attributes = this.getAttributes(message);
        aiActor.abilities = this.getAbilities(message);
        aiActor.details = this.getDetails(message);
        aiActor.traits = this.getLanguages(message);

        return aiActor;
    }

    static findString(message, regex, index=1) {
        let match = message.match(new RegExp(regex, "ig"));
        if(match.length > 0) {
            return match[0].match(new RegExp(regex, "i"))[index];
        }
        else {
            return "missing";
        }
    }

    static getName(message) {
        let name;
        const nameRegex = /\#\#\#\s(Name):\n(\w+\s+\w+)/;

        name = this.findString(message, nameRegex, 2);
        return name;
    }

    // static getSize(message) {}
    // static getCreatureType(message) {}
    // static getSpeed(message) {}

    static getAbilities(message) {
        let abilities = {};
        abilities.str = {};
        abilities.dex = {};
        abilities.con = {};
        abilities.int = {};
        abilities.wis = {};
        abilities.cha = {};

        const abilitiesRegex = /\|\s+((\d+)\s+\([-+]\d+\)\s)\|\s+((\d+)\s+\([-+]\d+\)\s)\|\s+((\d+)\s+\([-+]\d+\)\s)\|\s+((\d+)\s+\([-+]\d+\)\s)\|\s+((\d+)\s+\([-+]\d+\)\s)\|\s+((\d+)\s+\([-+]\d+\)\s)\|/;

        abilities.str.value = this.findString(message, abilitiesRegex, 2);
        // TODO: add or check proficiencies? 
        abilities.dex.value = this.findString(message, abilitiesRegex, 4);
        abilities.con.value = this.findString(message, abilitiesRegex, 6);
        abilities.int.value = this.findString(message, abilitiesRegex, 8);
        abilities.wis.value = this.findString(message, abilitiesRegex, 10);
        abilities.cha.value = this.findString(message, abilitiesRegex, 12);

        return abilities;
    } // STR, DEX, CON, INT, WIS, CHA

    static getAttributes(message) {
        let attributes = {};
        attributes.ac = {};
        attributes.movement = {};
        attributes.senses = {};
        attributes.hp = {};

        const armorRegex = /\*\*(Armor Class|AC)\*\*\s+(\d+)\s*(\(([\s\w]+)\))?/;
        const speedRegex = /\*\*Speed\*\*\s+(\d+)/;
        const sensesRegex = /\*\*Senses\*\*\s+(\w+\s+)(\d+)\s+(\w+.)/;
        const hpRegex = /\*\*(Hit Points|HP)\*\*\s+(\d+)\s+\((\w+\d+)\)/;
        
        // Armor Check
        let armorMatches = message.match(new RegExp(armorRegex, "ig"));
        if(armorMatches.length > 0)
        {
            attributes.ac.armor = armorMatches[0].match(new RegExp(armorRegex, "i"))[2];
            if(armorMatches[0].match(new RegExp(armorRegex, "i"))[3]) {
                attributes.ac.equippedArmor = armorMatches[0].match(new RegExp(armorRegex, "i"))[3];
            }
            else {
                attributes.errors.armor = "missing";
            }
        }
        else { 
            attributes.errors.ac = "missing"; 
        }

        // Speed Check
        let speedMatches = message.match(new RegExp(speedRegex, "ig"));
        if(speedMatches.length > 0) {
            attributes.movement.walk = speedMatches[0].match(new RegExp(speedRegex, "i"))[1];
        }
        else {
            attributes.errors.speed = "missing";
        }

        // Senses
        let sense = this.findString(message, sensesRegex, 1);
        sense = sense.toLowerCase().trim();
        switch(sense) {
            case 'darkvision':
                attributes.senses.darkvision = this.findString(message, sensesRegex, 2);
                break;
            default:
                break;
        }

        // Hit Points
        attributes.hp.max = this.findString(message, hpRegex, 2);
        attributes.hp.value = attributes.hp.max;
        attributes.hp.formula = this.findString(message, hpRegex, 3);

        return attributes;
    } // ac {armor: base:} {equippedArmor: name}, attunement {}. movement {}, senses {}, spellcasting: 

    // static getBonuses(message) {} // abilities {check: save: skill: } {spell: dc}
    static getDetails(message) {
        let details = {};
        details.biography = {};

        const alignmentRegex = /\#\#\#\s+(Alignment:)\s+(\w+\s+\w+)/;
        const shortDescRegex = /\#\#\#\s+(Short Description:)\n([\w\s.'"]+)/;
        const longDescRegex = /\#\#\#\s+(Long Description:)\n([\w\s.'",]+)/;
        const challengeRegex = /\*\*(Challenge)\*\*\s+([\d/]+)\s+\(([\d]+)\s(XP)\)/;

        details.alignment = this.findString(message, alignmentRegex, 2);
        details.biography.value = this.findString(message, shortDescRegex, 2);
        details.biography.value += "<p>" + this.findString(message, longDescRegex, 2);
        let cr = this.findString(message, challengeRegex, 2);
        details.cr = eval(cr);
        details.xp = this.findString(message, challengeRegex, 3);

        return details;
    } // alignment, biography, cr, type, race?

    static getLanguages(message) {
        let traits = {};
        traits.languages = {};
        traits.languages.value = [];

        const languageRegex = /\*\*(Languages)\*\*\s+([\w,\s]+)/;
        let l = this.findString(message, languageRegex, 2);
        let ls = l.split(',');
        ls.forEach((element) => traits.languages.value.push(element));

        return traits;
    }

    // static getSkills(message) {} // acr, ani, arc, ath, dec, his, ins, inv, itm, med, nat, per, prc, prf, rel, slt, ste, sur
    // static getSpells(message) {}

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
            width: '1039',
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
          case 'send_message': {
            let ai_message = llmLib.callLlm('Message');
            aiActor.setLastUpdate(ai_message);
            aiActor.setNPC();
            // Foundry uses showdown to convert markdown to html
            let converter = new showdown.Converter();
            let newHTML = converter.makeHtml(ai_message);

            let ai_element = document.getElementById('ai-response');
            ai_element.innerHTML += newHTML;
            break;
          }
    
          case 'make_ai_actor': {
            if(aiActor.getLastUpdate() === undefined) {
                // Don't do anything if no messages have been sent or created
                break;
            }
            else {
                let ai_element = aiActor.getLastUpdate();
                console.log(ai_element);
                let actorObject = aiActor.parseMessage(ai_element);
                console.log(actorObject);

                let compendiumString = "Compendium.dnd5e.items.Item.";
                let pack = game.packs.get("dnd5e.items");
                let littleItem = pack.search({ query:"Studded Leather Armor +3"});
                let item = await fromUuid(compendiumString + littleItem[0]._id);

                let tempActor = {
                    name: actorObject.name,
                    type: "npc",
                    system: actorObject
                };
                
                let newActor = await Actor.create(tempActor);

                //console.log(newActor);

                let actor = game.actors.get(newActor.id);

                // console.log(item);

                // IMPORTANT this MUST be AWAITED
                await actor.createEmbeddedDocuments("Item", [item]);

                let addedItem = actor.items.find(i => i.name == littleItem[0].name);
                let equipped = {
                    system: {
                        equipped: true
                    }
                }
                await addedItem.update(equipped);
                
                // actor.prepareEmbeddedDocuments();


                console.log(actor);
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