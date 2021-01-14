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
    console.log(list, arr);
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
$("#task-form-modal .btn-primary").click(function() {
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
  // auto focus
  dateInput.trigger("focus");
});

// due date change
$(".list-group").on("blur", "input[type='text']", function() {
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
});
//~~~~~EDIT TASK END~~~~~

//~~~~~DRAG AND DROP START~~~~~
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    console.log("activate",this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over",event.target);
  },
  out: function(event) {
    console.log("out",event.target);
  },
  update: function(event) {
    console.log("update", this);
  }
});

//~~~~~DRAG AND DROP END~~~~~

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


