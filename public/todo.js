//Creating a new Todo
$("input").keypress(function(event){
	if(event.which===13){
		var todoText=$(this).val();
		$("ul").append("<li><span style='cursor:pointer' ondragover='allowdrop(event)' ondrop='drop(event)' draggable='true' ondragstart='drag(event)'><i class='fas fa-trash-alt'></i></span>"+todoText+"</li>");
		$("input").val("");
		
	}	
});
// Deleting a Todo
$("ul").on("click","span",function(event){
	
	$(this).parent().fadeOut("500",function(){
		$(this).remove();
	});

	event.stopPropagation();

});
//Crossing the Todo
$("ul").on("click","li",function(){
	$(this).toggleClass("crossed");
});

// 

//Adding Listener to the AddTodo Button
$("#plus").click(function(){
	$("input").fadeIn("500");
	$("#plus").css({display:"none"});
	$("#minus").css({display:"inline-block"});

});

$("#minus").click(function(){
	$("input").fadeOut("500s");
	$("#plus").css({display:"block"});
	$("#minus").css({display:"none"});
	$("#extra").css({display:"none"});

});