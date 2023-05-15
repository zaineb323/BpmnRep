import { Component, Injectable, OnInit } from '@angular/core';
import { BpmnStePServiceService } from '../bpmn-ste-pservice.service';
@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-moncomponent',
  templateUrl: './moncomponent.component.html',
  styleUrls: ['./moncomponent.component.css'],
  providers: [BpmnStePServiceService],

})

 export class MoncomponentComponent implements OnInit {
  constructor(private bpmnStePService: BpmnStePServiceService) { }
  fileInput!: HTMLInputElement;

  ngOnInit() {

    this.fileInput = document.getElementById('fileInput') as HTMLInputElement;
    this.fileInput.addEventListener('change', () => {
      const file = this.fileInput.files![0];
      const reader = new FileReader();
      reader.onload = () => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(reader.result as string, "text/xml");

        const steps = xmlDoc.getElementsByTagName("bpmn:userTask");
        const exclusiveGateway = xmlDoc.getElementsByTagName("bpmn:exclusiveGateway");
        const parallelGateway = xmlDoc.getElementsByTagName("bpmn:parallelGateway");

        const comparators = [...this.getBlocsFromXml('test', exclusiveGateway)];
        const convergence = [...this.getBlocsFromXml('convergence', parallelGateway)];
        const stepsArray = [...this.getBlocsFromXml('activity', steps)];

        const startEvent: any = { type: 'debut' };
        const endEvent: any= { type: 'fin' };

        startEvent.outgoing = xmlDoc.getElementsByTagName("bpmn:startEvent")[0].getElementsByTagName('bpmn:outgoing')[0].innerHTML;
        endEvent.incoming = xmlDoc.getElementsByTagName("bpmn:endEvent")[0].getElementsByTagName('bpmn:incoming')[0].innerHTML;

        const simulationArray = [startEvent, ...comparators, ...convergence, ...stepsArray, endEvent];
        console.log(simulationArray);

        this.globalFunc(simulationArray);
      };
      reader.readAsText(file);
    });
  }

  async globalFunc(tab: any[]) {
    let current = tab[0];
    current.next = current.outgoing;
    console.log(current.name);
    this.addElementToList(current.type);

    let i = 1;
    while (i < tab.length - 1) {
      if (tab[i].incoming.find((elt: string) => elt === current.next)) {
        current = tab[i];
        if (current.type === 'activity') {
          await this.bpmnStePService.saveBpmnStep(current) // Enregistrer l'élément actuel dans la base de données
          .subscribe(
            () => console.log('Étape enregistrée avec succès :', current),
            (error: any) => console.error('Erreur lors de l\'enregistrement de l\'étape :', error)
          );
          this.addElementToList(current.name);
          current.next = current.outgoing[0];
          console.log(current.name);
        } else if (current.type === 'test') {
          if (current.name === 'age <3?') {
            const input = await this.promptModal(current.name);
            current.next = parseInt(input) < 3 ? current.outgoing[0] : current.outgoing[1];
          } else {
            const input = await this.customModal(current.name);
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
    this.addElementToList(tab[tab.length - 1].type);
  }

  customModal(message: string): Promise<string> {
    return new Promise((resolve) => {
      const modal = document.getElementById("myModal")!;
      const modalText = document.getElementById("modal-text")!;
      const modalYes = document.getElementById("modal-yes")!;
      const modalNo = document.getElementById("modal-no")!;

      modalText.textContent = message;
      modal.style.display = "block";

      modalYes.addEventListener("click", () => {
        modal.style.display = "none";
        resolve("yes");
      });

      modalNo.addEventListener("click", () =>{

        modal.style.display = "none";
        resolve("no");
    });
    });
  }
    promptModal(message: string): Promise<string> {
      return new Promise((resolve) => {
        const modal1 = document.getElementById("promptModal")!;
        const modalText = document.getElementById("modal-text1")!;
        const modalOk = document.getElementById("modalOKBtn")!;
        const modalInput = document.getElementById("modalInput") as HTMLInputElement;
        modalInput.placeholder = "Entrez votre âge";
        modalText.textContent = message;
        modal1.style.display = "block";

        modalOk.addEventListener("click", () => {
          const inputVal = modalInput.value;
          modal1.style.display = "none";
          resolve(inputVal);
        });
      });
    }

    addElementToList(elt: string) {
      const listItem = document.createElement("li");
      listItem.textContent = elt;
      document.getElementById("etapes")?.appendChild(listItem);
    }

    getBlocsFromXml(type: string, tab: HTMLCollectionOf<Element>) {
      const array: any[] = [];
      for (let i = 0; i < tab.length; i++) {
        const bloc: any = {};
        const name = tab[i].getAttribute("name");
        bloc.name = name;
        bloc.outgoing = [];
        bloc.incoming = [];
        const outgoing = tab[i].getElementsByTagName('bpmn:outgoing');
        const incoming = tab[i].getElementsByTagName('bpmn:incoming');
        for (let outI = 0; outI < outgoing.length; outI++) {
          const element = outgoing[outI].innerHTML;
          bloc.outgoing.push(element);
        }
        for (let outI = 0; outI < incoming.length; outI++) {
          const element = incoming[outI].innerHTML;
          bloc.incoming.push(element);
        }
        bloc.type = type;
        array.push(bloc);
      }
      return array;
    }
  }


