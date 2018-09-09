function registerAjax(event){
        var username = document.getElementById("rusername").value;
        var password1 = document.getElementById("rpassword1").value;
        var password2 = document.getElementById("rpassword2").value;
        var dataString = "username=" + encodeURIComponent(username) + "&password1=" + encodeURIComponent(password1) + "&password2=" + encodeURIComponent(password2);

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", "calendarRegister.php", true);
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xmlHttp.addEventListener("load", function(event){
                var jsonData = JSON.parse(event.target.responseText);
                if(!jsonData.success){
                        alert("Registration failed. "+ jsonData.message);
                }else {
                        alert("Registration successful. Please log in.");
                }
        }, false);

        xmlHttp.send(dataString);
}

document.getElementById("register").addEventListener("click", registerAjax, false); //create id register
