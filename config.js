/* CONFIGURAÇÃO: cole aqui a URL do Web App do Apps Script (termina em /exec).
     Enquanto estiver vazia, o site roda em modo demonstração e nada é gravado. */
  window.LAWD_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby2nujpNBFYOX5gfXkG0zVYJ6Qfc2dAbnRcO8DQOTs24Xo8Krh8YF0URzifyixW79Oz/exec";

/* Semanas do cronograma da LAWD, compartilhadas entre as páginas. */
window.LAWD_SEMANAS = [
  { id:"0",  tema:"Fundamentos da Web", entrega:"Mapa visual ou diagrama explicando o caminho de uma requisição." },
  { id:"1",  tema:"HTML, CSS e responsividade", entrega:"Mini site responsivo com pelo menos duas páginas conectadas." },
  { id:"2",  tema:"JavaScript, DOM e eventos", entrega:"Aplicação de lista de tarefas com criação, conclusão e remoção de itens." },
  { id:"3",  tema:"Git, GitHub e trabalho em equipe", entrega:"Projeto em equipe versionado, com histórico de commits e divisão de tarefas." },
  { id:"4",  tema:"APIs e requisições HTTP", entrega:"Aplicação que consome dados externos e apresenta informações ao usuário." },
  { id:"5",  tema:"Autenticação e acesso", entrega:"Fluxo de login simulado ou funcional integrado ao projeto." },
  { id:"6",  tema:"Figma e prototipagem", entrega:"Protótipo navegável de uma aplicação curta." },
  { id:"7",  tema:"Componentização", entrega:"Refatoração de parte do projeto usando componentes reutilizáveis." },
  { id:"8",  tema:"Testes e verificação", entrega:"Testes ou roteiro de validação para os fluxos principais." },
  { id:"9",  tema:"MCP e ferramentas de IA", entrega:"Um MCP próprio, um agente que chama uma tool dele e a integração de um MCP de terceiros." },
  { id:"10", tema:"Revisão, code review e projeto final", entrega:"Mini POC final apresentada e registrada no GitHub." }
];

/* Entregas antigas foram gravadas como 1.1/1.2 e 2.1/2.2; hoje contam como a semana inteira. */
window.LAWD_NORMALIZAR_SEMANA = function(id){
  return String(id == null ? "" : id).trim().replace(/^(\d+)\.\d+$/, "$1");
};
