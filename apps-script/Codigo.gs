/**
 * LAWD UFS — Backend de entregas (Google Apps Script)
 *
 * Cole este arquivo em Extensões > Apps Script dentro da planilha
 * e publique como Web App (veja o README).
 *
 * Regra: uma linha por (usuário do GitHub + semana).
 * Reenvio para a mesma semana substitui a linha anterior.
 */

var NOME_ABA = "Entregas";
var CABECALHO = ["Enviado em", "Nome", "GitHub", "Semana", "Tema", "Repositório", "Envios"];

var SEMANAS_VALIDAS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
var RE_USUARIO = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
var RE_REPO = /^https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9._-]+\/?(?:[#?].*)?$/i;

// As semanas 1 e 2 já foram divididas em 1.1/1.2 e 2.1/2.2; hoje cada uma é uma entrega só.
function normalizarSemana(s) {
  return String(s == null ? "" : s).trim().replace(/^(\d+)\.\d+$/, "$1");
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    var nome = String(d.nome || "").trim().replace(/\s+/g, " ").slice(0, 120);
    var github = String(d.github || "").trim().replace(/^@/, "");
    var semana = normalizarSemana(d.semana);
    var tema = String(d.tema || "").trim().slice(0, 120);
    var repo = String(d.repositorio || "").trim().replace(/\.git$/, "").replace(/\/$/, "");

    if (nome.length < 3) return json({ ok: false, erro: "Nome inválido." });
    if (!RE_USUARIO.test(github)) return json({ ok: false, erro: "Usuário do GitHub inválido." });
    if (SEMANAS_VALIDAS.indexOf(semana) === -1) return json({ ok: false, erro: "Semana inválida." });
    if (!RE_REPO.test(repo)) return json({ ok: false, erro: "Link de repositório inválido." });

    lock.waitLock(10000);
    var aba = obterAba();
    var agora = new Date();

    // procura entrega existente do mesmo aluno na mesma semana (1.1 e 1.2 contam como 1)
    var ultima = aba.getLastRow();
    if (ultima > 1) {
      var valores = aba.getRange(2, 3, ultima - 1, 2).getDisplayValues(); // GitHub, Semana
      for (var i = 0; i < valores.length; i++) {
        if (valores[i][0].toLowerCase() === github.toLowerCase() && normalizarSemana(valores[i][1]) === semana) {
          var linha = i + 2;
          var envios = Number(aba.getRange(linha, 7).getValue()) || 1;
          aba.getRange(linha, 1, 1, 7).setValues([[agora, nome, github, semana, tema, repo, envios + 1]]);
          return json({ ok: true, acao: "atualizada", linha: linha });
        }
      }
    }

    aba.appendRow([agora, nome, github, semana, tema, repo, 1]);
    return json({ ok: true, acao: "criada", linha: aba.getLastRow() });

  } catch (err) {
    return json({ ok: false, erro: "Erro no servidor: " + err.message });
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

// ?acao=listar devolve as entregas para a página "quem entregou";
// sem parâmetro, só confirma que a URL está no ar.
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.acao === "listar") return json(listarEntregas());
  return json({ ok: true, servico: "LAWD entregas", status: "no ar" });
}

// Uma entrega por (GitHub + semana): se sobrou 1.1 e 1.2 do mesmo aluno, fica a mais recente.
function listarEntregas() {
  var aba = obterAba();
  var ultima = aba.getLastRow();
  if (ultima < 2) return { ok: true, entregas: [] };

  var valores = aba.getRange(2, 1, ultima - 1, 7).getValues();
  var porChave = {};
  for (var i = 0; i < valores.length; i++) {
    var v = valores[i];
    var github = String(v[2] || "").trim();
    var semana = normalizarSemana(v[3]);
    if (!github || !semana) continue;
    var data = v[0] instanceof Date ? v[0] : null;
    var chave = github.toLowerCase() + "|" + semana;
    var atual = porChave[chave];
    if (atual && atual._t >= (data ? data.getTime() : 0)) continue;
    porChave[chave] = {
      _t: data ? data.getTime() : 0,
      enviadoEm: data ? data.toISOString() : "",
      nome: String(v[1] || ""),
      github: github,
      semana: semana,
      repositorio: String(v[5] || ""),
      envios: Number(v[6]) || 1
    };
  }

  var entregas = Object.keys(porChave).map(function (k) {
    var x = porChave[k];
    delete x._t;
    return x;
  });
  return { ok: true, entregas: entregas };
}

function obterAba() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(NOME_ABA);
  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA);
  }
  if (aba.getLastRow() === 0) {
    aba.appendRow(CABECALHO);
    aba.getRange(1, 1, 1, CABECALHO.length).setFontWeight("bold").setBackground("#6a18e0").setFontColor("#ffffff");
    aba.setFrozenRows(1);
    aba.getRange("A:A").setNumberFormat("dd/MM/yyyy HH:mm");
    aba.getRange("D:D").setNumberFormat("@"); // guarda a semana como texto, não como número
  }
  return aba;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
