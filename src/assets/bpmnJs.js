    // Récupérer l'élément input pour lire le fichier XML
    var fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', function() {
        // Récupérer le fichier XML sélectionné
        var file = fileInput.files[0];
        // Lire le contenu du fichier XML
        var reader = new FileReader();
        reader.onload = function() {
            // Analyser le contenu XML
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(reader.result, "text/xml");
            // Obtenir les éléments "step" du document XML
            var steps = xmlDoc.getElementsByTagName("bpmn:userTask");
            // Obtenir les éléments "tests" du document XML
            var exclusiveGateway = xmlDoc.getElementsByTagName("bpmn:exclusiveGateway");
            // Obtenir les éléments "convergence" du document XML
            var parallelGateway = xmlDoc.getElementsByTagName("bpmn:parallelGateway");
            //Arronger chaque type des elements dans un tableau
            const comparators = [...getBlocsFromXml('test', exclusiveGateway)];
            const convergence = [...getBlocsFromXml('convergence', parallelGateway)];
            const stepsArray = [...getBlocsFromXml('activity', steps)];
            // Obtenir les 2 bloques debut et fin
            const startEvent = {
                type: 'debut'
            }
            const endEvent = {
                type: 'fin'
            }
            startEvent.outgoing = xmlDoc.getElementsByTagName("bpmn:startEvent")[0].getElementsByTagName('bpmn:outgoing')[0].innerHTML;
            endEvent.incoming = xmlDoc.getElementsByTagName("bpmn:endEvent")[0].getElementsByTagName('bpmn:incoming')[0].innerHTML;
            //concatener tous les differentes bloques du fichier dans un seul tableau
            const simulationArray = [startEvent, ...comparators, ...convergence, ...stepsArray, endEvent]
            console.log(simulationArray);
            globalFunc(simulationArray);
            //la fonction globale
            async function globalFunc(tab) {
                let current = tab[0];
                current.next = current.outgoing;
                console.log(current.name)
                addElementToList(current.type);
                let i = 1;
                while (i < tab.length - 1) {
                    if (tab[i].incoming.find(elt => elt === current.next)) {
                        current = tab[i];
                        if (current.type === 'activity') {
                            addElementToList(current.name);
                            current.next = current.outgoing[0];
                            console.log(current.name)
                        } else if (current.type === 'test') {

                            if (current.name === 'age <3?') {
                                // Utiliser un modal avec une zone de texte pour demander l'âge
                                const input = await promptModal(current.name);
                                // Vérifier si l'âge est inférieur à 3 ou non
                                current.next = parseInt(input) < 3 ? current.outgoing[0] : current.outgoing[1];
                            } else {
                                //appel de la fonction
                                const input = await customModal(current.name);
                                current.next = input === 'yes' ? current.outgoing[0] : current.outgoing[1];
                            }
                        } else if (current.type === 'convergence') {
                            current.next = current.outgoing[0];
                        }
                        i = 1;
                    } else {
                        i++;
                    }
                }
                addElementToList(tab[tab.length - 1].type)
            }


            // fonction de modal
            function customModal(message) {
                return new Promise((resolve, reject) => {
                    // Obtenir l'élément modal
                    const modal = document.getElementById("myModal");

                    // Obtenir le texte modal et les boutons
                    const modalText = document.getElementById("modal-text");
                    const modalYes = document.getElementById("modal-yes");
                    const modalNo = document.getElementById("modal-no");

                    // Définir le texte modal
                    modalText.textContent = message;
                    // Show de modal
                    modal.style.display = "block";

                    // Ajouter des écouteurs d'événements aux boutons
                    modalYes.addEventListener("click", () => {
                        // Hide de modal
                        modal.style.display = "none";
                        // Résoudre avec la valeur d'entrée
                        resolve("yes");
                    });

                    modalNo.addEventListener("click", () => {
                        // Hide de modal
                        modal.style.display = "none";
                        // Résoudre avec la valeur d'entrée
                        resolve("no");
                    });
                });
            }


            //function de modal age
            function promptModal(message) {
                return new Promise((resolve, reject) => {
                    // Créer le HTML du modal
                    const modal1 = document.getElementById("promptModal");
                    // Obtenir le texte modal et les boutons
                    const modalText = document.getElementById("modal-text1");
                    const modalOk = document.getElementById("modalOKBtn");
                    const modalInput = document.getElementById("modalInput");
                    modalInput.placeholder = "Entrez votre âge";
                    // Définir le texte modal
                    modalText.textContent = message;
                    // Show de modal
                    modal1.style.display = "block";

                    // Ajouter un événement au clic sur le bouton OK
                    modalOk.addEventListener("click", () => {
                        const inputVal = $('#modalInput').val();
                        modal1.style.display = "none";

                        resolve(inputVal);
                    });

                });
            }


            // fonction qui ajoute un nouveau element à la liste
            function addElementToList(elt) {
                var listItem = document.createElement("li");
                listItem.textContent = elt;
                document.getElementById("etapes").appendChild(listItem);
            }
            // fonction qui rtourne la liste des bloques sous la forme d'un tableau et qui prend en parametre le type de bloque (activité ou test) et les elements de dom
            function getBlocsFromXml(type, tab) {
                const array = [];
                for (var i = 0; i < tab.length; i++) {
                    const bloc = {};
                    var name = tab[i].getAttribute("name");
                    bloc.name = name;
                    bloc.outgoing = [];
                    bloc.incoming = [];
                    var outgoing = tab[i].getElementsByTagName('bpmn:outgoing');
                    var incoming = tab[i].getElementsByTagName('bpmn:incoming');
                    for (let outI = 0; outI < outgoing.length; outI++) {
                        const element = outgoing[outI].innerHTML;
                        bloc.outgoing.push(element)
                    }
                    for (let outI = 0; outI < incoming.length; outI++) {
                        const element = incoming[outI].innerHTML;
                        bloc.incoming.push(element)
                    }
                    bloc.type = type;
                    array.push(bloc)
                }
                return array
            }
        };
        reader.readAsText(file);
    });