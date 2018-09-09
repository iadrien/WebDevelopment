function renderReview(review) {
  console.log("Rendering review");
  var reviewItem = document.createElement("li");
  reviewItem.setAttribute("class", "list-group-item row");
  var nameDiv = document.createElement("div");
  nameDiv.innerHTML = review.name
  reviewItem.appendChild(nameDiv);
  var reviewDiv = document.createElement("div");
  reviewDiv.innerHTML = '"' +review.text+'"';
  reviewItem.appendChild(reviewDiv);
  document.getElementById("reviews-list").appendChild(reviewItem);
}

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function(){
  if (this.readyState == 4 && this.status == 200){
    var recommendations = JSON.parse(this.responseText);
    console.log(recommendations);
    for(var i=0; i<recommendations.length; ++i){
    renderReview(recommendations[i]);
    }
  }
};
xhttp.open("GET", "https://cse104.kraigh.com/recommendations?api_key=3d1dde44ef071b1042d7b296fdf86ed313a1cdb96eecd61c951376ff310d5d76", true);
xhttp.send();


document.getElementById("sendreview").addEventListener("submit", submitForm);

function submitForm(event) {
  event.preventDefault();
  var name = document.getElementById("sendreview").elements.namedItem("name").value;
  var text = document.getElementById("sendreview").elements.namedItem("review").value;
  var api_key = "3d1dde44ef071b1042d7b296fdf86ed313a1cdb96eecd61c951376ff310d5d76";
  // Initalize AJAX Request
  var xhttp2 = new XMLHttpRequest();
  // Response handler
  xhttp2.onreadystatechange = function() {
    // Wait for readyState = 4
    if (this.readyState == 4 && this.status == 200) {
        var recommendation = JSON.parse(this.responseText);
        renderReview(recommendation);
        document.getElementById("sendreview").elements.namedItem("name").value = '';
        document.getElementById("sendreview").elements.namedItem("review").value = '';
    } else if (this.readyState == 4) {
        console.log(this.responseText);
    }
  };

  xhttp2.open("POST", "https://cse104.kraigh.com/recommendations", true);
  xhttp2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp2.send("api_key="+api_key+"&name="+name+"&text="+text);
}
