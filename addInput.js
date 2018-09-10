document.addEventListener('DOMContentLoaded', function() {
var counter = 1;
var limit = 3;
var score = 1;
var min = 3;

function addSource(divName){
     if (counter == limit)  {
          alert("You have reached the limit of adding " + counter + " inputs");
     }
     else {
          var newdiv = document.createElement('div');
          newdiv.innerHTML = "Source " + (counter + 1) + " <br><input type='text' name='myInputs[]'>";
          document.getElementById(divName).appendChild(newdiv);
          counter++;
     }
}

function addComment(divName){
	 if (score == min)  {
          alert("You don't have sufficient privileges to comment on this post.");
     }
     else {
     //This has to be handled differently in the plugin mode
            $("#cplus").load("/js/form.html");
     //var div = document.getElementById(divName);


        }

}
});