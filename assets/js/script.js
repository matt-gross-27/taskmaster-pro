var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);
  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);
  // check due date
  auditTask(taskLi);
  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-save").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

//~~~~~EDIT TASK START~~~~~
// select ul.list-group. 
// if a child p is clicked, execute function()
$(".list-group").on("click", "p", function() {
  var text = $(this)
    .text()
    .trim();
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  // change p to the newly created <textarea>
  $(this).replaceWith(textInput);
  // focus the user curser on the area
  textInput.trigger("focus");
});

// on blur from text area
$(".list-group").on("blur", "textarea", function(){
  // get the textarea's value
  var text = $(this)
    .val()
    .trim();
  // get the parent ul's id
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-","");
  // get the task's index in the list of lis
  var index = $(this)
    .closest(".list-group-item")
    .index();
  tasks[status][index].text = text
  saveTasks();
  // turn the textarea back into a p
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);
  //recreate pEl
  $(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
    .text()
    .trim();
  // create new inputEl
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  // swap out elements
  $(this).replaceWith(dateInput);
  //enable jQuery ui datepicker
  dateInput.datepicker({
    minDate: 0,
    onClose: function() {
      $(this).trigger("change");
    }
  });
  // auto focus
  dateInput.trigger("focus");
});

// due date change
$(".list-group").on("change", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();
  // get the parent ul's id
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  //get the task index in the ul
  var index = $(this)
    .closest(".list-group-item")
    .index();
  // update task in array and re-save to localStorage
  tasks[status][index].date = date;
  saveTasks();
  // recreate spanEl with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  // replace input with the spanEl
  $(this).replaceWith(taskSpan);
  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});
//~~~~~EDIT TASK END~~~~~

//~~~~~DRAG AND DROP START~~~~~
// sortable widget https://api.jqueryui.com/sortable/
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  tolerance: "pointer",
  helper: "clone",
  scrollSensitivity: 10,
  scrollSpeed: 10,
  containment: $("main"),
  activate: function() {
    $(this).addClass("dropover")
    $(".bottom-trash").addClass("bottom-trash-drag")
  },
  deactivate: function() {
    $(this).removeClass("dropover")
    $(".bottom-trash").removeClass("bottom-trash-drag")
  },
  over: function(event) {
    $(event.target).addClass("dropover-active");
  },
  out: function(event) {
    $(event.target).removeClass("dropover-active");
  },
  update: function(event) {
    // array to store the task data in
    var tempArr = [];
    // loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();
      var date = $(this)
        .find("span")
        .text()
        .trim();
      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });
    // trim down list's id to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-","");
    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

// droppable widget https://api.jqueryui.com/droppable/
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
  },
  over: function(event, ui) {
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function(event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-active");
  }
});
//~~~~~DRAG AND DROP END~~~~~

//date picker widget https://api.jqueryui.com/datepicker/
$("#modalDueDate").datepicker({
  minDate: 0
});

//audit tasks with moment.js
var auditTask = function(taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();
  // convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);
  // remove any old classes from the element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  // apply new class if task is near/over due date
  if(moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  // apply bootstrap warning class to list-group-items 2 days away from due date 
  else if(Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};


// Run audit task function every half hour
setInterval(
  function() {
    $(".card .list-group-item").each(
      function(index, el) {
      auditTask(el);
    });
  }, 1000 * 60 * 30);

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  // save tasks
  saveTasks();
});

// load tasks for the first time
loadTasks();