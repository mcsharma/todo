Parse.initialize("8BKp1MnDzuFW6dn4jMkIbdujI2caMy56NWoXlavI", "nCdUG2nkTmpDUR6LWJtFTBnFI0Y7VgT7sBUrgL7N");
var Todo = Parse.Object.extend("Todo");
var isExistingEmail = false;
var givenEmail = null;

window.onload = function() {
	if (Parse.User.current()) {
		onLoggedInUser();
	} else {
		onLoggedOutUser();
	}
};

function onLoggedInUser() {
	$('#welcome').text('Welcome ').append(
	  $('<b>').text(Parse.User.current().get('username'))
	);
	$('#welcome').show();
	$('#logout').show();
	$('#password_form').hide();
	$('#todo_composer').show();
	$('#new_todo').bind('keyup', onKeyPressInComposer);
	loadTodoList();
}

function onLoggedOutUser() {
    $('#todo_list').empty();
    $('#new_todo').unbind("keyup", onKeyPressInComposer);
    $('#todo_composer').hide();
    $('#logout').hide();
	$('#welcome').hide();
	$('#email_form').show();
	$('#password_form').hide();
}

function submitEmail () {
	givenEmail = $('#email').val();
	Parse.Cloud.run('emailExists', {email: givenEmail}, {
      success: onEmailSearchResponse,
      error: function(error) {alert(error);}
    });
}

function onEmailSearchResponse(emailExists) {
    isExistingEmail = emailExists;
	$('#email_form').hide();
	var text = isExistingEmail
	  ? 'Please enter your password'
	  : 'Please create a new password';
	$('#password_cta').text(text);
	$('#password_form').bind('keyup', onKeyPressInPassword);
  	$('#password_form').show();
}

function submitPassword() {
	$('#password_form').unbind('keyup', onKeyPressInPassword);
	var password = $('#password').val();
	if (isExistingEmail) {
		Parse.User.logIn(givenEmail, password, {
		  success: function(user) {
		    onLoggedInUser(user);
		  },
		  error: errorHandler
	  });
	} else {
		user = new Parse.User();
		user.set('email', givenEmail);
		user.set('username', givenEmail);
		user.set("password", password);
		user.signUp(null, {
	  	  success: onLoggedInUser,
		  error: errorHandler
	  });
	}
}

function loadTodoList() {
  var query = new Parse.Query(Todo);
  query.equalTo('owner', Parse.User.current().id);
  query.find({success: function (todoList) {
    renderTodoList(todoList);
  }});
}

function renderTodoList(todoList) {
  $('#todo_list').show();
  todoList.forEach(function(item) {
    prependTodo(item);
  });
}

function prependTodo(todo) {
  $('#todo_list').prepend(
    $('<li>', {class: 'todoItem'})
    .append($('<input>', {type: 'hidden', value: todo.id}).html(''))
    .append($('<span>', {class: 'todoText'}).text(todo.get('text')+' '))
    .append(
      $('<a>', {href: '#', class: 'removeLink'})
      .text('remove')
      .bind('click', deleteTodo)
    )
  );
}

function logout() {
	Parse.User.logOut();
	onLoggedOutUser();
}

function saveNewTodo() {
	var text = $('#new_todo').val().trim();
	if (!text) {
	  return;
	}
    var todo = new Todo();
    todo.set("text", text);
    todo.set('owner', Parse.User.current().id);
    todo.setACL(new Parse.ACL(Parse.User.current()));

    todo.save(null, {
      success: function(todo) {
        $('#new_todo').val('');
        prependTodo(todo);
      },
      error: errorHandler
    });
}

function deleteTodo(event) {
  var todo = new Todo();
  todo.id = $(event.target).parent().find('input[type="hidden"]').val();
  todo.destroy({
    success: function (todo) {
      $(event.target).closest('li.todoItem').remove();
    },
    error: errorHandler
  });
}

function onKeyPressInComposer(event) {
  // Enter key
  if(event.keyCode == 13) {
    $('#add_button').click();
  }
}
function onKeyPressInPassword(event) {
  if(event.keyCode == 13) {
    $('#password_button').click();
  }
}

function errorHandler(object, error) {
	alert("Error: " + error.code + " " + error.message);
}

