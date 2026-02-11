// copied from https://file.garden/ZdYqv9vlqFbDy9iO/the%20dialogue%20toolkit.js
// no is license asserted over this file.

// CUSTOM DIALOGUE TOOLKIT 2.0

// made by dem, inspired by noobogonis's :)
////////// DIALOGUE ACTORS //////////

// these "global" actors are inserted by corru.js
// but it often confuses people who are unable to find them
// so i put them here for extra clarity
//     sourceless: {
//         type: "sourceless",
//     },

//     "sourceless quiet": {
//         name: "sourceless",
//         type: "sourceless",
//         voice: false
//     },

//     "sourceless noprocess": {
//         name: "sourceless",
//         type: "sourceless",
//         voice: false,
//         noProcess: true
//     },

//     "combat": {
//         name: "combat",
//         type: "combat-message",
//         noProcess: true,
//     },

//     "sourceless incoherent": {
//         name: "sourceless",
//         type: "sourceless incoherent",
//     },

//     moth: {
//         image: '/img/sprites/moth/mothman.gif',
//         type: "external moth",
//         noProcess: true,
//     },

//     unknown: {
//         image: '/img/sprites/velzie/smile2.png',
//         type: "velzie",
//         element: "#velzieface",
//         noProcess: true,
//         voice: ()=>{play('talksignal', 0.5)}
//     },

//     self: {
//         image: '/img/portraits/interloper.gif',
//         type: "interloper",
//         noProcess: true,
//         player: true
//     },

//     sys: {
//         image: '/img/mui/mindspikelogoactive.gif',
//         type: "mindspike",
//         player: true,
//         noProcess: true,
//         voice: ()=>{play('muiScanner', 2)}
//     },

//     "sys quiet": {
//         name: "sys",
//         image: '/img/mui/mindspikelogoactive.gif',
//         type: "mindspike",
//         player: true,
//         noProcess: true,
//         voice: false
//     },

//     funfriend: {
//         element: "#funfriend",
//         image: '/img/sprites/funfriend/funfriend.gif',
//         type: "obesk funfriend",
//         voice: ()=>{play('talk', 2)}
//     },

//     proxyfriend: {
//         element: ".ffproxy",
//         image: '/img/sprites/funfriend/proxyfriend.gif',
//         type: "obesk funfriend",
//         voice: ()=>{play('talkhigh', 1)}
//     },

//     akizet: {
//         image: '/img/sprites/akizet/portrait.gif',
//         type: "obesk qou akizet",
//         element: ".truecreature .akizet",
//         player: true,
//         voice: ()=>play('talk', 2.5)
//     },

//     bstrd: {
//         image: '/img/sprites/bstrd/bstrd.gif',
//         type: "bstrd portrait-cover",
//         element: ".bstrd",
//         voice: ()=>play('talkgal', 0.4)
//     },

//     actual_site_error: {
//         noProcess: true,
//         image: '/img/viendbot.png',
//         type: "metafiend portrait-dark portrait-contain",
//         voice: ()=>{play('muiClick', 2)}
//     },

//     bugviend: {
//         name: 'Â»ÃµGQÃ Âº3Â¾Ãµâ€cR%',
//         type: "incoherent thoughtform portrait-blocker hallucination",
//         image: "/img/sprites/combat/foes/hallucinations/portrait.gif",
//         voice: ()=>play('fear', 2)
//     },

//     effigy: {
//         image: '/img/local/uncosm/ozo/akieffigy_portrait.gif',
//         type: "thoughtform awakened portrait-haze portrait-cover",
//         element: "#realgrid .akieffigy",
//         voice: ()=>play('talkflower', 1.25)
//     },

//     bugout: {
//         image: "/img/sprites/daemons/knight/scan.gif",
//         type: "bstrd uppercase portrait-contain",
//         voice: ()=>play('talkcroak', 0.6)
//     },

//     fairy: {
//         element: ".ozofriend.eyefriend",
//         image: '/img/local/uncosm/ozo/sprite_portrait.gif',
//         type: "thoughtform fairy awakened portrait-haze portrait-auto portrait-center",
//         voice: ()=>play('talkfairy')
//     },

//     envoy: {
//         image: "/img/local/city/envoybutton.gif",
//         type: "recollection portrait-bright portrait-cover",
//         element: ".envoy",
//         voice: ()=>play('talk', 0.9)
//     },

//     "s w   al kk": {
//         image: "/img/local/city/pedestrian5.gif",
//         type: "recollection portrait-top portrait-cover incoherent",
//         voice: ()=>play('talkcroak', 0.85),
//         element: ".swalk",
//     },

//     rotwatcher: {
//         element: ".rotwatcher",
//         type: "actor-sourceless rotwatcher thoughtform portrait-auto portrait-center",
//         voice: ()=>play('talkrot')
//     },

export function insertExtraActors() {
    /* /hello/ */
    window.env.dialogueActors["sentry"] = {
        image: "/img/textures/corruripple.gif",
        type: "sentry obesk",
        player: false,
    };

    /* /local/dullvessel/ */
    window.env.dialogueActors["pilot cyst"] = {
        elementID: "pilotcyst0",
        image: "/img/local/orbit/dullvessel/pilotsphere_tendrils.gif",
        type: "obesk pilotcyst",
        voice: () => window.play("talk", 0.4),
    };

    window.env.dialogueActors["glazika"] = {
        elementID: "glazika3",
        image: "/img/local/orbit/dullvessel/glazikaeye.gif",
        type: "obesk glazika",
        voice: () => window.play("talk"),
    };

    /* /local/uncosm/recosm/ */
    window.env.dialogueActors["god"] = {
        image: "/img/local/uncosm/tostile.gif",
        type: "thoughtform portrait-contain portrait-bright obesk",
        voice: () => window.play("talkhigh", 0.45),
        element: ".bastard.goal",
    };

    window.env.dialogueActors["friend"] = {
        image: "/img/textures/eyetran.gif",
        type: "thoughtform portrait-contain portrait-dark incoherenthello",
        voice: () => window.play("talklaugh", 0.4),
        element: ".friend",
    };

    /* /local/uncosm/where/ */
    window.env.dialogueActors["¥Óñ«J"] = {
        type: "thoughtform incoherent portrait-cover portrait-blocker loose-thought",
        image: "/img/sprites/akizet/eyeswarped.gif",
        voice: () => window.play("talkcore", 0.5),
    };
    window.env.dialogueActors["stupid"] = {
        type: "thoughtform portrait-contain portrait-darkripple larval loose-thought",
        image: "/img/sprites/obesk/larval/larval1.gif",
        player: true,
        name: "stupid",
    };
    window.env.dialogueActors["hesitant"] = {
        type: "thoughtform portrait-contain portrait-darkripple obesk larval loose-thought",
        image: "/img/sprites/obesk/larval/larval3.gif",
        name: "hesitant",
    };
    window.env.dialogueActors["origin"] = {
        type: "thoughtform portrait-contain obesk qou portrait-dark",
        image: "/img/textures/weyetran.gif",
        player: true,
    };
    window.env.dialogueActors["tired"] = {
        type: "thoughtform portrait-contain portrait-darkripple larval qou loose-thought",
        image: "/img/sprites/obesk/larval/larval2.gif",
        name: "tired",
    };
    window.env.dialogueActors["guard"] = {
        type: "thoughtform portrait-contain portrait-darkripple obesk larval loose-thought",
        image: "/img/sprites/obesk/larval/larval4.gif",
        name: "guard",
    };
    window.env.dialogueActors["elder"] = {
        type: "thoughtform portrait-contain portrait-darkripple obesk larval loose-thought",
        image: "/img/sprites/obesk/larval/larval6.gif",
        name: "elder",
    };
    window.env.dialogueActors["other"] = {
        type: "thoughtform portrait-contain obesk qou portrait-dark loose-thought",
        image: "/img/sprites/obesk/larval/larval5.gif",
        name: "other",
    };
    window.env.dialogueActors["mind"] = {
        type: "thoughtform obesk loose-thought",
        image: "/img/textures/eyetran.gif",
        name: "mind",
    };
    window.env.dialogueActors["other2"] = {
        type: "thoughtform portrait-contain obesk qou portrait-dark",
        image: "/img/textures/ceyetran.gif",
        name: "other",
    };
    window.env.dialogueActors["flower"] = {
        name: "flower",
        image: "/img/textures/yeyetran.gif",
        type: "thoughtform portrait-contain portrait-dark",
    };
    window.env.dialogueActors["wiser"] = {
        type: "thoughtform portrait-contain obesk qou portrait-dark",
        image: "/img/textures/eyetran.gif",
        player: true,
        name: "wiser",
    };
    window.env.dialogueActors["kind"] = {
        type: "thoughtform portrait-contain portrait-darkripple obesk larval loose-thought",
        image: "/img/sprites/obesk/larval/larval8.gif",
        name: "kind",
    };
    window.env.dialogueActors["dog"] = {
        type: "thoughtform portrait-cover portrait-dark obesk",
        image: "/img/local/embassy/isoportrait.gif",
        name: "dog",
    };

    /* /local/city/street/ */
    window.env.dialogueActors["cashier"] = {
        image: "/img/local/city/realeye.gif",
        type: "recollection portrait-bright portrait-cover",
        element: "#realgrid .cashier.cafegfx",
        voice: () => window.play("talk", 2),
    };

    window.env.dialogueActors["cousin"] = {
        image: "/img/local/city/realeye.gif",
        type: "recollection portrait-bright portrait-cover",
        voice: () => window.play("talk", 1),
    };

    window.env.dialogueActors["slim streetwalker"] = {
        image: "/img/local/city/pedestrian3.gif",
        type: "recollection portrait-top portrait-cover incoherent",
        voice: () => window.play("talk", 0.85),
        element: ".slim",
    };

    window.env.dialogueActors["stre wal k"] = {
        image: "/img/local/city/pedestrian1.gif",
        type: "recollection portrait-top portrait-cover incoherent",
        voice: () => window.play("muiToggle", 0.5),
        element: ".creep",
    };

    window.env.dialogueActors["cloaked streetwalker"] = {
        image: "/img/local/city/realeye.gif",
        type: "recollection portrait-bright portrait-cover",
        element: ".busy",
        voice: () => window.play("talk", 0.9),
    };

    window.env.dialogueActors["television"] = {
        image: "/img/local/city/tv.gif",
        type: "recollection",
        voice: () => window.play("talkcore", 3),
    };

    window.env.dialogueActors["obesk"] = {
        image: "/img/local/city/tv.gif",
        type: "recollection obesk qou",
        voice: () => window.play("talkcore", 1.2),
    };

    window.env.dialogueActors["something"] = {
        image: "/img/local/city/tv.gif",
        type: "recollection incoherent",
        voice: () => window.play("talkcore", 0.5),
    };

    window.env.dialogueActors["isabel_c"] = {
        name: "isabel",
        image: "/img/local/uncosm/ozo/flowerfriend_portrait.gif",
        type: "thoughtform flowerfriend recollection portrait-cover portrait-bright",
        voice: () => window.play("talkfloweralt", 1),
    };

    /* /local/beneath/ */
    window.env.dialogueActors["s w   al kk"] = {
        image: "/img/local/city/pedestrian5.gif",
        type: "recollection portrait-top portrait-cover incoherent",
        voice: () => window.play("talkcroak", 0.85),
        element: ".civvie",
    };

    window.env.dialogueActors["drowning"] = {
        name: "Ƙø¿ƶḳ¿±",
        expressions: {
            default: {
                image: "/img/local/beneath/drowningportrait.gif",
                voice: () => window.play("talklaugh", 0.9),
                type: "recollection thoughtform portrait-darkstatic portrait-cover drowning",
                exec: () => {
                    window.env.abyss.drowningFear(0);
                },
            },
            scared: {
                image: "/img/local/beneath/drowningportrait_scared.gif",
                voice: () => window.play("talklaugh", 0.75),
                type: "recollection thoughtform portrait-darkstatic portrait-cover drowning drowning_scared",
                exec: () => {
                    window.env.abyss.drowningFear(1);
                },
            },
            panic: {
                image: "/img/local/beneath/drowningportrait_panic.gif",
                voice: () => window.play("talklaugh", 0.6),
                type: "recollection thoughtform portrait-darkstatic portrait-cover drowning drowning_panic",
                exec: () => {
                    window.env.abyss.drowningFear(2);
                },
            },
            safe: {
                image: "/img/local/beneath/drowningportrait_safe.gif",
                voice: () => window.play("talklaugh", 0.9),
                type: "recollection thoughtform portrait-darkstatic portrait-cover drowning",
                exec: () => {
                    window.env.abyss.drowningFear(-1);
                },
            },
        },
    };

    window.env.dialogueActors["drowning sourceless"] = {
        name: "$Ø‰Ɍ¿ɇ§",
        type: "drowning_sourceless",
        voice: () => window.play("muiReadout", 0.75),
    };

    window.env.dialogueActors["drowning akizet"] = {
        name: "Â£¿Ž¿",
        type: "recollection thoughtform portrait-darkstatic portrait-cover drowning",
        image: "/img/textures/weyetran.gif",
        voice: () => window.play("talksignal", 1.5),
        player: true,
    };

    /* local/beneath/parasite/ */
    window.env.dialogueActors["piece"] = {
        image: "/img/local/beneath/palpurp.gif",
        type: "thoughtform portrait-cover incoherent",
        voice: () => window.play("talkcore", 3),
    };

    window.env.dialogueActors["shelf"] = {
        image: "/img/local/beneath/pieces/shelf.gif",
        type: "thoughtform portrait-cover incoherent obesk incoherent-mild",
        voice: () => window.play("talkcore", 2.5),
    };

    window.env.dialogueActors["smiling piece"] = {
        image: "/img/local/beneath/pieces/g.gif",
        type: "thoughtform portrait-cover incoherent obesk incoherent-mild",
        voice: () => window.play("talklaugh", 3),
    };

    window.env.dialogueActors["many-eyed piece"] = {
        image: "/img/local/beneath/pieces/m.gif",
        type: "thoughtform portrait-cover incoherent obesk incoherent-mild",
        voice: () => window.play("talkgal", 2.5),
    };

    window.env.dialogueActors["curled piece"] = {
        image: "/img/local/beneath/pieces/a.gif",
        type: "thoughtform portrait-cover incoherent obesk incoherent-mild",
        voice: () => window.play("talk", 3),
    };

    window.env.dialogueActors["calm piece"] = {
        image: "/img/local/beneath/pieces/b.gif",
        type: "thoughtform portrait-cover incoherent obesk incoherent-mild",
        voice: () => window.play("talk", 0.6),
    };

    window.env.dialogueActors["pleased piece"] = {
        image: "/img/local/beneath/pieces/c.gif",
        type: "thoughtform portrait-cover incoherent obesk incoherent-mild",
        voice: () => window.play("talk", 3.3),
    };

    window.env.dialogueActors["weeping piece"] = {
        image: "/img/local/beneath/pieces/i.gif",
        type: "thoughtform portrait-cover incoherent obesk incoherent-mild",
        voice: () => window.play("talkcore", 3.5),
    };

    window.env.dialogueActors["friendly piece"] = {
        image: "/img/local/beneath/pieces/k.gif",
        type: "thoughtform portrait-cover incoherent obesk incoherent-mild",
        voice: () => window.play("talklaugh", 2.5),
    };

    window.env.dialogueActors["four-eyed piece"] = {
        image: "/img/local/beneath/pieces/ka.gif",
        type: "thoughtform portrait-cover incoherent obesk incoherent-mild",
        voice: () => window.play("talkcore", 3),
    };

    window.env.dialogueActors["stacked-eye piece"] = {
        image: "/img/local/beneath/pieces/t.gif",
        type: "thoughtform portrait-cover incoherent obesk incoherent-mild",
        voice: () => window.play("talk", 0.8),
    };

    /* local/ozo/ */
    window.env.dialogueActors["council"] = {
        image: "/img/sprites/council/portrait.gif",
        type: "thoughtform awakened portrait-haze portrait-auto portrait-center",
        voice: () => window.play("talkchoir"),
        expressions: {
            default: {
                image: "/img/sprites/council/portrait.gif",
            },
            god: {
                image: "/img/sprites/council/godportrait.gif",
            },
        },
    };

    window.env.dialogueActors["isabel"] = {
        image: "/img/local/uncosm/ozo/flowerfriend_portrait.gif",
        type: "thoughtform flowerfriend awakened portrait-cover portrait-haze",
        voice: () => window.play("talkflower"),
    };

    window.env.dialogueActors["fairy"] = {
        image: "/img/local/uncosm/ozo/sprite_portrait.gif",
        type: "thoughtform fairy awakened portrait-haze portrait-auto portrait-center",
        voice: () => window.play("talkfairy"),
    };

    window.env.dialogueActors["incoviewer"] = {
        name: "interviewer",
        image: "/img/local/ocean/ship/interviewerportrait.gif",
        type: "incoherent",
        voice: () => window.play("talk", 1.5),
    };

    /* local/ocean/embassy/ */
    window.env.dialogueActors["movefriend"] = {
        elementID: "movefriend0",
        image: "/img/local/embassy/liftfriend.gif",
        type: "obesk",
        voice: () => window.play("talk", 0.8),
    };

    window.env.dialogueActors["tozik"] = {
        image: "/img/sprites/obesk/tozik/portrait.gif",
        type: "obesk qou tozik portrait-contain portrait-blocker",
        element: ".truecreature .tozik",
        voice: () => window.play("talk", 1),
    };

    window.env.dialogueActors["gakvu"] = {
        image: "/img/sprites/obesk/gakvu/portrait.gif",
        element: ".truecreature .gakvu",
        type: "obesk qou gakvu portrait-contain",
        voice: () => window.play("talklaugh", 1),
    };

    window.env.dialogueActors["kazki"] = {
        image: "/img/sprites/obesk/kazki/portrait.gif",
        type: "obesk qou kazki portrait-contain",
        voice: () => window.play("talklaugh", 1.2),
    };

    window.env.dialogueActors["bozko"] = {
        image: "/img/sprites/obesk/bozko/portrait.gif",
        type: "obesk qou bozko portrait-contain",
        voice: () => window.play("talk", 0.8),
    };

    window.env.dialogueActors["cavik"] = {
        image: "/img/sprites/obesk/cavik/portrait.gif",
        type: "obesk qou cavik portrait-contain",
        voice: () => window.play("talk", 1.3),
    };

    window.env.dialogueActors["groundsmind"] = {
        image: "/img/local/embassy/groundsmindportrait.gif",
        type: "obesk groundsmind qou",
        voice: () => window.play("talkhigh", 1.2),
    };

    window.env.dialogueActors["timestopper"] = {
        type: "timestopper obesk",
        voice: () => window.play("talkhigh", 0.6),
    };

    window.env.dialogueActors["echo"] = {
        image: "/img/textures/disruptionM.gif",
        type: "obesk",
        voice: () => window.play("talkhigh", 0.8),
    };

    window.env.dialogueActors["aggressor"] = {
        image: "/img/sprites/aggressor/sigilback.gif",
        type: "incoherent",
        voice: () => window.play("talksignal"),
    };

    window.env.dialogueActors["itzil"] = {
        image: "/img/local/embassy/mindcore1portrait.gif",
        type: "obesk qou",
        voice: () => window.play("talkcore", 2),
    };

    window.env.dialogueActors["karik"] = {
        image: "/img/local/embassy/mindcore2portrait.gif",
        type: "obesk qou",
        voice: () => window.play("talkcore", 1),
    };

    window.env.dialogueActors["itzil quiet"] = {
        name: "itzil",
        image: "/img/local/embassy/mindcore1portrait.gif",
        type: "obesk qou",
        voice: false,
    };

    window.env.dialogueActors["karik quiet"] = {
        name: "karik",
        image: "/img/local/embassy/mindcore2portrait.gif",
        type: "obesk qou",
        voice: false,
    };

    window.env.dialogueActors["miltza"] = {
        image: "/img/sprites/obesk/miltza/portrait.gif",
        type: "obesk qou portrait-cover",
        voice: () => window.play("talkgal", 0.8),
    };

    window.env.dialogueActors["barfriend"] = {
        elementID: "barfriend12",
        image: "/img/sprites/obesk/golemportrait.gif",
        type: "obesk",
        voice: () => window.play("talk", 1.5),
    };

    window.env.dialogueActors["attendant"] = {
        image: "/img/local/embassy/spiredroneportrait.gif",
        type: "obesk groundsmind",
        voice: () => window.play("talk", 0.8),
    };

    /* local/ocean/embassy/golem/ */

    window.env.dialogueActors["geli"] = {
        name: "geli",
        type: "obesk qou portrait-cover portrait-blocker",
        voice: () => window.play("talkgel", 0.9),
        expressions: {
            default: {
                image: "/img/sprites/obesk/geli/portrait.gif",
                exec: () => document.querySelectorAll("#geli").forEach((el) => el.setAttribute("expression", "")),
            },
            concern: {
                image: "/img/sprites/obesk/geli/portrait_concern.gif",
                exec: () => document.querySelectorAll("#geli").forEach((el) => el.setAttribute("expression", "concern")),
            },
            happy: {
                image: "/img/sprites/obesk/geli/portrait_happy.gif",
                exec: () => document.querySelectorAll("#geli").forEach((el) => el.setAttribute("expression", "happy")),
            },
            think: {
                image: "/img/sprites/obesk/geli/portrait_think.gif",
                exec: () => document.querySelectorAll("#geli").forEach((el) => el.setAttribute("expression", "think")),
            },
            uncanny: {
                image: "/img/sprites/obesk/geli/portrait_uncanny.gif",
                exec: () => document.querySelectorAll("#geli").forEach((el) => el.setAttribute("expression", "uncanny")),
            },
            blueeyes: {
                image: "/img/sprites/obesk/geli/portrait_blueeyes.gif",
                exec: () => document.querySelectorAll("#geli").forEach((el) => el.setAttribute("expression", "blueeyes")),
            },
        },
    };

    window.env.dialogueActors["ik"] = {
        name: "karik",
        image: "/img/sprites/obesk/ikgol/portrait.gif",
        type: "obesk qou portrait-cover portrait-blocker",
        voice: () => window.play("talkcore", 0.5),
    };

    window.env.dialogueActors["kivii"] = {
        name: "dozkallvi",
        image: "/img/sprites/combat/foes/kivii/portrait.gif",
        type: "obesk qou portrait-cover portrait-blocker incoherent",
        voice: () => window.play("talkgal", 0.25),
    };

    window.env.dialogueActors["translation core"] = {
        image: "/img/sprites/combat/foes/translator_sigil.gif",
        type: "obesk qou portrait-cover portrait-blocker incoherent",
        voice: () => window.play("talksignal", 0.4),
    };

    window.env.dialogueActors["husk"] = {
        image: "/img/sprites/combat/foes/husks/tinynausea.gif",
        type: "obesk qou portrait-cover portrait-fear incoherent",
        voice: () => window.play("talksignal", 0.6),
    };

    /* /local/ocean/ship/interview/ */
    window.env.dialogueActors["interviewer"] = {
        elementID: "buddy",
        image: "/img/local/ocean/ship/interviewerportrait.gif",
        voice: () => window.play("talk", 1.5),
    };

    /* EP3ADD2 AND EP4 DIALOGUE ACTORS WOOOOOOOOOOOOOOOOOOOOOOOO */
    window.env.dialogueActors["bsteli"] = {
        name: "geli",
        type: "obesk qou portrait-cover portrait-blocker bastard-color",
        expressions: {
            default: {
                image: "/img/sprites/obesk/geli/bsteli/portrait.gif",
            },
            bstrd: {
                class: "bastard-font",
                image: "/img/sprites/obesk/geli/bsteli/portrait_bstrd.gif",
            },
            concern: {
                image: "/img/sprites/obesk/geli/bsteli/portrait_concern.gif",
            },
            happy: {
                image: "/img/sprites/obesk/geli/bsteli/portrait_happy.gif",
            },
            think: {
                image: "/img/sprites/obesk/geli/bsteli/portrait_think.gif",
            },
            uncanny: {
                image: "/img/sprites/obesk/geli/bsteli/portrait_uncanny.gif",
            },
            blueeyes: {
                image: "/img/sprites/obesk/geli/bsteli/portrait_blueeyes.gif",
            },
        },
        voice: () => window.play("talkgel", 0.9),
        expression: "default",
        image: "/img/sprites/obesk/geli/bsteli/portrait.gif",
    };

    window.env.dialogueActors["stowaway"] = {
        image: "/img/sprites/loper.gif",
        type: "thoughtform portrait-top portrait-cover portrait-blocker",
    };

    window.env.dialogueActors["fungus"] = {
        image: "https://jooinn.com/images/mushroom-51.jpg",
        element: "bastard",
        type: "portrait-contain portrait-static",
        voice: () => window.play("talkcroak", 0.7),
    };

    window.env.dialogueActors["okidoia"] = {
        voice: () => window.play("okidoia"),
        expressions: {
            default: {
                voice: () => window.play("okidoia"),
            },
            dark: {
                type: "mutter",
                voice: () => window.play("scarydoia"),
            },
        },
    };

    window.env.dialogueActors["archivist"] = {
        type: "obesk qou portrait-contain portrait-blocker mutter",
        voice: () => window.play("scarydoia", 0.7),
        image: "/img/sprites/combat/foes/archivistportrait.gif",
    };

    window.env.dialogueActors["telyu"] = {
        image: "/img/sprites/obesk/telyu/portrait.gif",
        type: "obesk qou portrait-contain",
        voice: () => window.play("talkmind", 1.5),
        expressions: {
            default: {
                image: "/img/sprites/obesk/telyu/portrait.gif",
            },
            dark: {
                image: "/img/sprites/obesk/telyu/portrait_dark.gif",
            },
        },
    };

    window.env.dialogueActors["idril"] = {
        image: "/img/sprites/obesk/idril/portrait.gif",
        type: "obesk qou portrait-contain",
        voice: () => window.play("talkmind", 0.8),
    };

    //emulates the abyss so drowning kazki doesn't error out
    function drowningFear() {}
    if (!window.env.abyss) window.env.abyss = { drowningFear };

    // EP4ADD1
    window.env.dialogueActors["beast"] = {
        image: "/img/local/uncosm/pit/beastportrait.gif",
        type: "thoughtform incoherent portrait-blocker portrait-cover",
        voice: () => window.play("talkmind", 4),
    };

    window.env.dialogueActors["wakizet"] = {
        name: "akizet",
        expressions: {
            default: {
                type: "obesk qou tozik portrait-contain portrait-blocker",
                voice: () => window.play("talkether", false, 0.8),
                image: "/img/sprites/akizet/wakizet/wakizetportrait.gif",
            },

            pit: {
                type: "obesk qou tozik portrait-contain portrait-blocker",
                voice: () => window.play("talkoppress", false, 0.8),
                image: "/img/sprites/akizet/wakizet/wakizetportrait.gif",
            },

            loud: {
                type: "obesk qou uppercase portrait-contain portrait-bright mutter",
                voice: () => window.play("scarydoia", 0.3),
                image: "/img/sprites/akizet/wakizet/wakizetportrait.gif",
            },
        },
    };

    window.env.dialogueActors["wakeless"] = {
        name: "sourceless",
        type: "drowning_sourceless uppercase",
        voice: () => window.play("talkoppress", 0.75),
    };

    window.env.dialogueActors["wakeless quiet"] = {
        name: "sourceless",
        type: "drowning_sourceless uppercase",
        voice: false,
    };

    window.env.dialogueActors["cass"] = {
        name: "director",
        expressions: {
            default: {
                type: "portrait-contain portrait-bright",
                voice: () => window.play("talkcase", 1.25),
                image: "/img/sprites/director/collector_head_handle_portrait.gif",
            },

            open: {
                type: "portrait-contain portrait-dark incoherent cass",
                voice: () => window.play("talkcase", 0.5),
                image: "/img/sprites/director/collector_eye_collection_portrait.gif",
            },

            whisper: {
                type: "portrait-contain portrait-blocker incoherent cass",
                voice: () => window.play("talkcase", 0.75),
                image: "/img/sprites/director/collector_head_handle_portrait.gif",
            },
        },
    };

    window.env.dialogueActors["oliver"] = window.env.dialogueActors["cloaked streetwalker"] = {
        image: "/img/local/city/realeye.gif",
        type: "recollection portrait-bright portrait-cover",
        element: ".busy",
        voice: () => window.play("talk", 0.9),
    };

    window.env.dialogueActors["proxy"] = {
        image: "/img/sprites/vekoa/vekoaproxyportrait.gif",
        type: "thoughtform qou recollection portrait-blocker portrait-cover",
        voice: () => window.play("talkhigh", 0.75),
    };

    window.env.dialogueActors["malvi"] = {
        image: "/img/local/embassy/parpy/malviportrait.gif",
        type: "recollection thoughtform qou obesk portrait-static portrait-cover",
        voice: () => window.play("talkhigh", 0.5),
    };

    window.env.dialogueActors["wiser"] = {
        type: "obesk uppercase obesk-color",
        image: "/img/textures/disruptionM.gif",
        voice: () => window.play("talkcore", 1.75),
        player: true,
    };

    window.env.dialogueActors["frenetic"] = {
        type: "obesk uppercase friend-color",
        image: "/img/textures/disruptionC.gif",
        voice: () => window.play("talkcore", 2.25),
    };
}
