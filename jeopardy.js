let categories = [];

async function getCategoryIds() {
  const count = 6;
  try {
    let response = await axios.get("https://rithm-jeopardy.herokuapp.com/api/categories?count=100");
    let categories = response.data;
    return _.sampleSize(categories, count).map((cat) => cat.id);
  } catch (error) {
    console.error("Error fetching category IDs:", error);
  }
}

async function getCategory(catId) {
  try {
    let response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`);
    let category = response.data;
    console.log("Fetched category data:", category);
    return {
      title: category.title,
      clues: category.clues.map((clue) => ({
        question: clue.question,
        answer: clue.answer,
        showing: null,
      })),
    };
  } catch (error) {
    console.error("Error fetching category data", error);
  }
}
function fillTable() {
  let $thead = $("#jeopardy thead");
  let $tbody = $("#jeopardy tbody");

  $thead.empty();
  $tbody.empty();

  let $tr = $("<tr>");
  for (let category of categories) {
    $tr.append($("<th>").text(category.title));
  }
  $thead.append($tr);

  for (let clueIdx = 0; clueIdx < 5; clueIdx++) {
    let $tr = $("<tr>");
    for (let category of categories) {
      $tr.append($("<td>").attr("id", `${category.title}-${clueIdx}`).text("?"));
    }
    $tbody.append($tr);
  }
  console.log("Table filled with categories and clues");
}

function handleClick(evt) {
  let $cell = $(evt.target);
  let id = $cell.attr("id");
  let [catTitle, clueIdx] = id.split("-");
  let category = categories.find((c) => c.title === catTitle);
  let clue = category.clues[clueIdx];

  if (clue.showing === null) {
    $cell.text(clue.question);
    clue.showing = "question";
  } else if (clue.showing === "question") {
    $cell.text(clue.answer);
    clue.showing = "answer";
  }
}

function showLoadingView() {
  $("#loading").show();
  $("#start").hide();
}
function hideLoadingView() {
  $("#loading").hide();
  $("#start").show();
}

async function setupAndStart() {
  showLoadingView();

  let catIds = await getCategoryIds();
  categories = [];
  for (let catId of catIds) {
    let category = await getCategory(catId);
    categories.push(category);
  }

  fillTable();
  hideLoadingView();
}

$(document).ready(function () {
  $("#start").on("click", setupAndStart);
  $("#jeopardy").on("click", "td", handleClick);
});
