(function () {
    var dataArray;

    function loadContent() {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if ((xmlhttp.status >= 200 && xmlhttp.status < 300) || xmlhttp.status == 304) {
                    var originalDataArray = JSON.parse(xmlhttp.responseText);
                    dataArray = JSON.parse(localStorage.getItem('locStorContent')) || originalDataArray;
                    loadContentArray(dataArray);
                    setThumb();
                } else {
                    alert("Request was unsuccessful: " + xmlhttp.status);
                }
            }
        };

        xmlhttp.open("get", "content.json", true);
        xmlhttp.overrideMimeType('application/json');
        xmlhttp.send();
    }

    // thumbs gallery
    function setThumb() {
        var thumbItems = document.getElementsByClassName("js-thumb-items");
        for (var i = 0; i < thumbItems.length; i++) {
            thumbItems[i].addEventListener("click", function (event) {
                if (event.target.nodeName == "IMG") {
                    var currentThumbIndex = event.currentTarget.id.replace("thumbs-", "");
                    document.getElementById("largeImg-" + currentThumbIndex).src = event.target.src;
                }
            });
        }
    }
    

    // vote
    document.getElementById("root").addEventListener("click", function (event) {
        if (event.target && event.target.nodeName == "BUTTON") {
            var index = event.target.id.replace("vote-btn-", "");
            var sel = document.getElementById("select-rating-" + index);
            var ratingVal = sel.options[sel.selectedIndex].value;
            
            dataArray[index].rating.ratingCount = parseInt(dataArray[index].rating.ratingCount) + 1;
            dataArray[index].rating.ratingSum = parseInt(dataArray[index].rating.ratingSum) + parseInt(ratingVal);
            dataArray[index].rating.ratingValue = (dataArray[index].rating.ratingSum / dataArray[index].rating.ratingCount).toFixed(1);

            dataArray[index].voteStatus = "disabled";
            document.getElementById("vote-btn-" + index).setAttribute("disabled", "");

            document.getElementById("rating-value-" + index).innerHTML = dataArray[index].rating.ratingValue;
            document.getElementById("rating-count-" + index).innerHTML = dataArray[index].rating.ratingCount;
            localStorage.setItem('locStorContent', JSON.stringify(dataArray));

            document.getElementById("vote-btn-" + index).setAttribute("disabled", "");

            document.getElementById("rating-item-" + index).style.width = ((140 * dataArray[index].rating.ratingValue) / 10) + "px";
        }
    });

    // upload new content
    document.getElementsByClassName("upload-form")[0].addEventListener("submit", function (event) {
        var newContentItem = {
            images: {},
            rating: {}
        };
        var imgPattern = /^https?:\/\/.+\.(jpg|gif|png|jpeg|tiff|bmp)$/;
        var imgArray = document.getElementsByClassName("img-upload");
        var itemTitle = document.getElementById("item-title").value;
        var itemDescription = document.getElementById("item-description").value;
        var selectedType = document.getElementById("item-type");

        for (var i = 0; i < imgArray.length; i++) {
            if (imgPattern.test(imgArray[i].value)) {
                continue;
            } else {
                event.preventDefault();
                return;
            }
        }

        if (itemTitle.length != "" && itemTitle.length <= 110) {
            newContentItem.title = itemTitle;
        } else {
            document.getElementsByClassName("error-1")[0].style.display = "block";
            event.preventDefault();
            return;
        }

        if (itemDescription.length != 0 && itemDescription.length <= 1000) {
            newContentItem.description = itemDescription;
        } else {
            document.getElementsByClassName("error-2")[0].style.display = "block";
            event.preventDefault();
            return;
        }

        newContentItem.genre = selectedType.value;
        newContentItem.type = selectedType.options[selectedType.selectedIndex].parentNode.label.toLowerCase();
        newContentItem.index = dataArray.length;

        newContentItem.images.url1 = document.getElementById("img-url-1").value;
        newContentItem.images.url2 = document.getElementById("img-url-2").value;
        newContentItem.images.url3 = document.getElementById("img-url-3").value;

        newContentItem.rating.ratingValue = "0";
        newContentItem.rating.ratingCount = "0";
        newContentItem.rating.ratingSum = "0";

        dataArray.push(newContentItem);
        localStorage.setItem('locStorContent', JSON.stringify(dataArray));

        loadContentArray(dataArray);

        document.getElementById("show-upload-form").style.width = "0";
        document.getElementsByClassName("upload-form")[0].reset();

        pager.init();
        pager.showPage(1);
        setThumb();
    });

    
    document.getElementsByClassName("left-menu-list")[0].addEventListener("click", function (event) {
        event.preventDefault();
        switch (event.target.id) {
            case "all-content":
                filterArray("all-content");
                break;
            case "all-videos":
                filterArray("video");
                break;
            case "video-drama":
                filterArray("drama");
                break;
            case "video-action":
                filterArray("action");
                break;
            case "video-sci-fi":
                filterArray("sci-fi");
                break;
            case "book-cookbooks":
                filterArray("cookbooks");
                break;
            case "book-history":
                filterArray("history");
                break;
            case "book-romance":
                filterArray("romance");
                break;
            case "all-books":
                filterArray("book");
                break;
        }
    });
    

    function filterArray(filterParameter) {
        var newDataArray;

        if (filterParameter == "all-content") {
            newDataArray = dataArray;
        } else if (filterParameter == "video" || filterParameter == "book") {
            newDataArray = dataArray.filter(function (i) {
                return (i.type == filterParameter);
            });
        } else {
            newDataArray = dataArray.filter(function (i) {
                return (i.genre == filterParameter);
            });

        }

        loadContentArray(newDataArray);
        pager.init();
        pager.showPage(1);
        setThumb();
    }

    
    function loadContentArray(arr) {
        var out = '';

        for (var i = 0; i < arr.length; i++) {
            out += '<article class="row content page-list-elem">' +
                        '<div class="col-4">' +
                            '<div class="thumb-large">' +
                                '<img id="largeImg-' + i + '" src="' + arr[i].images.url1 + '" alt="' + arr[i].title + '" title="' + arr[i].title + '"/>' +
                            '</div>' +
                            '<ul class="js-thumb-items" id="thumbs-' + i + '">' +
                                '<li class="thumb-small">' +
                                    '<img src="' + arr[i].images.url1 + '" alt="' + arr[i].title + '"/>' +
                                '</li>' +
                                '<li class="thumb-small">' +
                                    '<img src="' + arr[i].images.url2 + '" alt="' + arr[i].title + '"/>' +
                                '</li>' +
                                '<li class="thumb-small">' +
                                    '<img src="' + arr[i].images.url3 + '" alt="' + arr[i].title + '"/>' +
                                '</li>' +
                            '</ul>' +
                        '</div>' +
                        '<div class="col-8">' +
                            '<header>' +
                                '<h2 id="' + arr[i].title + '" class="content-title">' + arr[i].title + '</h2>' +
                            '</header>' +
                            '<p>Genre: ' + arr[i].genre + '</p>' +
                            '<p class="content-description">' + arr[i].description + '</p>' +
                            '<a href="#' + arr[i].title + '" class="see-more">See more</a>' +
                            '<div class="rating-wrapper">' +
                                '<div class="rating-stars">' +
                                    '<span class="rating-bg"></span>' +
                                    '<span id="rating-item-' + arr[i].index + '" class="rating-current" style="width:' + ((140 * arr[i].rating.ratingValue) / 10) + 'px"></span>' +
                                '</div>' +
                                '<p>Rating: ' +
                                    '<span id="rating-value-' + arr[i].index + '" class="js-rating-sort">' + arr[i].rating.ratingValue + '</span>/' +
                                    '<span>10</span> Votes: ' +
                                    '<span id="rating-count-' + arr[i].index + '" class="js-votes-sort">' + arr[i].rating.ratingCount + '</span>' +
                                '</p>Rate this ' +
                                '<select id="select-rating-' + arr[i].index + '" class="select-rating">' +
                                    '<option value="1">1</option>' +
                                    '<option value="2">2</option>' +
                                    '<option value="3">3</option>' +
                                    '<option value="4">4</option>' +
                                    '<option value="5">5</option>' +
                                    '<option value="6">6</option>' +
                                    '<option value="7">7</option>' +
                                    '<option value="8">8</option>' +
                                    '<option value="9">9</option>' +
                                    '<option value="10">10</option>' +
                                '</select>' +
                                '<button id="vote-btn-' + arr[i].index + '" class="vote-btn" type="submit"' + arr[i].voteStatus + '>Vote</button>' +
                            '</div>' +
                        '</div>' +
                   '</article>';
        }
        document.getElementById("root").innerHTML = out + '<p class="no-search-results"></p><div id="page-nav-position" class="pagination"></div>';
    }

    loadContent();

})();


function Pager(listName, itemsPerPage) {
    this.listName = listName;
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.pages = 0;
    this.showRecords = function (from, to) {
        var rows = document.getElementsByClassName(listName);
        for (var i = 0; i < rows.length; i++) {
            if (i < from || i > to) {
                rows[i].style.display = 'none';
            } else {
                rows[i].style.display = '';
            }
        }
    }

    this.showPage = function (pageNumber) {
        this.currentPage = pageNumber;
        var from = (pageNumber - 1) * itemsPerPage;
        var to = from + itemsPerPage - 1;
        this.showRecords(from, to);

        if (this.currentPage == 1) {
            this.showPageNav(this.currentPage, 5);
            var newPageAnchor = document.getElementById('pg' + this.currentPage);
            newPageAnchor.className = 'pg-active';
        } else if (this.currentPage >= 3) {
            this.showPageNav(this.currentPage - 2, this.currentPage + 2);
            var newPageAnchor = document.getElementById('pg' + this.currentPage);
            newPageAnchor.className = 'pg-active';
        } else if (this.currentPage < 3) {
            this.showPageNav(this.currentPage - 1, this.currentPage + 3);
            var newPageAnchor = document.getElementById('pg' + this.currentPage);
            newPageAnchor.className = 'pg-active';
        }

        if (this.pages < 6) {
            if (this.pages == 0) {
                this.pages = 1;
            }
            this.showPageNav(1, this.pages);
            var newPageAnchor = document.getElementById('pg' + this.currentPage);
            newPageAnchor.className = 'pg-active';
        }

        if (this.pages >= 6 && this.currentPage + 1 >= this.pages) {
            this.showPageNav(this.pages - 4, this.pages);
            var newPageAnchor = document.getElementById('pg' + this.currentPage);
            newPageAnchor.className = 'pg-active';
        }
    }

    this.prev = function () {
        if (this.currentPage > 1)
            this.showPage(this.currentPage - 1);
    }

    this.next = function () {
        if (this.currentPage < this.pages) {
            this.showPage(this.currentPage + 1);
        }
    }

    this.init = function () {
        var rows = document.getElementsByClassName(listName);
        var records = rows.length;
        this.pages = Math.ceil(records / itemsPerPage);
    }

    this.showPageNav = function (a, b) {
        var element = document.getElementById("page-nav-position");
        var pagerHtml = '<a onclick="pager.prev();" class="pg-normal">&laquo;</a>';

        for (var page = a; page <= b; page++) {
            pagerHtml += '<a id="pg' + page + '" class="pg-normal" onclick="pager.showPage(' + page + ');">' + page + '</a>';
        }

        pagerHtml += '<a onclick="pager.next();" class="pg-normal">&raquo;</a>';
        element.innerHTML = pagerHtml;
    }
}

var pager = new Pager('page-list-elem', 5);

window.addEventListener("load", function () {
    pager.init();
    pager.showPage(1);
});


document.getElementById("show-upload").addEventListener("click", function () {
    document.getElementById("show-upload-form").style.width = "100%";
    document.getElementById("item-title").focus();
});

document.getElementById("close-upload-btn-2").addEventListener("click", function () {
    document.getElementById("show-upload-form").style.width = "0";
});

document.getElementById("close-upload-btn-1").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("show-upload-form").style.width = "0";
});


// hide or show sign-up and login form 
(function () {
    var signUpModal = document.getElementsByClassName("sign-up-modal")[0];
    var signInModal = document.getElementsByClassName("sign-in-modal")[0];
    var cancelBtn = document.getElementsByClassName("cancel-btn");

    document.getElementById("show-top-nav").addEventListener("click", function (event) {
        if (event.target.id == "sign-up") {
            signUpModal.style.display = "block";
            document.getElementById("username").focus();
        }

        if (event.target.id == "sign-in") {
            signInModal.style.display = "block";
            document.getElementById("signin-name").focus();
        }
    });

    for (var i = 0; i < cancelBtn.length; i++) {
        document.getElementsByClassName("cancel-btn")[i].addEventListener("click", function () {
            signInModal.style.display = "none";
            signUpModal.style.display = "none";
        });
    }

    window.addEventListener("click", function (event) {
        if (event.target == signUpModal || event.target == signInModal) {
            signUpModal.style.display = "none";
            signInModal.style.display = "none";
        }
    });
})();


// hide or show filter list
document.getElementsByClassName("left-menu-list")[0].addEventListener("click", function (event) {
    event.preventDefault();
    var target = event.target;
    var videoGenreList = document.getElementById("js-hidden-video-list");
    var bookGenreList = document.getElementById("js-hidden-book-list");

    if (target.id == "js-show-video-genre") {
        videoGenreList.classList.toggle("left-menu-hide");
        videoGenreList.classList.toggle("left-menu-show");
        target.firstElementChild.classList.toggle("caret");
        target.firstElementChild.classList.toggle("caret-rotate");
    } else if (target.id == "js-show-book-genre") {
        bookGenreList.classList.toggle("left-menu-hide");
        bookGenreList.classList.toggle("left-menu-show");
        target.firstElementChild.classList.toggle("caret");
        target.firstElementChild.classList.toggle("caret-rotate");
    }
});


// show top navigation
document.getElementsByClassName("top-menu-icon")[0].addEventListener("click", function () {
    document.getElementById("show-top-nav").classList.toggle("top-nav-list");
});


// slider
(function () {
    var slideIndex = 1;
    showSlides(slideIndex);

    document.getElementsByClassName("slideshow-container")[0].addEventListener("click", function (event) {
        var target = event.target;

        if (target.className == "slide-prev") {
            event.preventDefault();
            showSlides(slideIndex += -1);
        } else if (target.className == "slide-next") {
            event.preventDefault();
            showSlides(slideIndex += 1);
        } else if (target.className == "slide") {
            slideIndex = Number(target.getAttribute("data-slide-to"));
            showSlides(slideIndex);
        }
    });

    function showSlides(n) {
        var slides = document.getElementsByClassName("slides");
        var slideBtn = document.getElementsByClassName("slide");

        if (n > slides.length) {
            slideIndex = 1;
        }
        if (n < 1) {
            slideIndex = slides.length;
        }

        for (var i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
            slideBtn[i].classList.remove("current-slide");
        }

        slides[slideIndex - 1].style.display = "block";
        slideBtn[slideIndex - 1].classList.add("current-slide");
    }
})();


// sign-out
document.getElementById("sign-out").addEventListener("click", function () {
    var welcomeUser = document.getElementsByClassName("welcome-user")[0];

    document.getElementById("sign-up").style.display = "";
    document.getElementById("sign-in").style.display = "";
    document.getElementById("sign-out").style.display = "none";
    welcomeUser.style.display = "none";
    welcomeUser.innerHTML = "";
});


// sign-up form
document.getElementById("form-sign-up").addEventListener("submit", function (event) {
    event.preventDefault();
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if ((xmlhttp.status >= 200 && xmlhttp.status < 300) || xmlhttp.status == 304) {
                var users = JSON.parse(xmlhttp.responseText);
                var dataUsers = JSON.parse(localStorage.getItem('usersLocalSt')) || users;

                var userName = document.getElementById("username").value;
                var userEmail = document.getElementById("useremail").value;
                var userPassword = document.getElementById("userpassword").value;

                var welcomeUser = document.getElementsByClassName("welcome-user")[0];
                var formData = {};
                var emailPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

                if (emailPattern.test(userEmail)) {
                    formData.email = userEmail;
                } else {
                    return;
                }

                formData.username = userName;
                formData.password = userPassword;

                document.getElementById("sign-up").style.display = "none";
                document.getElementById("sign-in").style.display = "none";

                document.getElementById("sign-out").style.display = "block";
                welcomeUser.style.display = "block";
                welcomeUser.innerHTML = "Welcome <br> <span>" + userName + "<span>";

                dataUsers.push(formData);

                localStorage.setItem('usersLocalSt', JSON.stringify(dataUsers));

                document.getElementsByClassName("sign-up-modal")[0].style.display = "none";
                document.getElementById("form-sign-up").reset();
            } else {
                alert("Request was unsuccessful: " + xmlhttp.status);
            }

        }
    };

    xmlhttp.open("get", "users.json", true);
    xmlhttp.overrideMimeType('application/json');
    xmlhttp.send();
});


// login form
document.getElementById("form-sign-in").addEventListener("submit", function (event) {
    event.preventDefault();
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if ((xmlhttp.status >= 200 && xmlhttp.status < 300) || xmlhttp.status == 304) {
                var users = JSON.parse(xmlhttp.responseText);
                var dataUsers = JSON.parse(localStorage.getItem('usersLocalSt')) || users;
                var signInName = document.getElementById("signin-name").value;
                var signInPassword = document.getElementById("signin-password").value;
                var welcomeUser = document.getElementsByClassName("welcome-user")[0];

                for (var i = 0; i < dataUsers.length; i++) {
                    if (dataUsers[i].username == signInName && dataUsers[i].password == signInPassword) {
                        document.getElementsByClassName("sign-in-modal")[0].style.display = "none";
                        document.getElementById("form-sign-in").reset();

                        document.getElementById("sign-up").style.display = "none";
                        document.getElementById("sign-in").style.display = "none";

                        document.getElementById("sign-out").style.display = "block";
                        welcomeUser.style.display = "block";
                        welcomeUser.innerHTML = "Welcome <br> <span>" + signInName + "<span>";
                    }
                }
            } else {
                alert("Request was unsuccessful: " + xmlhttp.status);
            }
        }
    };

    xmlhttp.open("get", "users.json", true);
    xmlhttp.overrideMimeType('application/json');
    xmlhttp.send();
});


// search in content
document.getElementById("search-content").addEventListener("keyup", function (event) {
    var box = document.getElementsByClassName("content");
    var input = document.getElementById("search-content");
    var filter = input.value.toUpperCase();

    var isEverywhereChecked = document.getElementById("search-everywhere").checked;
    var isTitleChecked = document.getElementById("search-title").checked;
    var isDescChecked = document.getElementById("search-desc").checked;

    var resultsLength = document.getElementsByClassName("page-list-elem").length;
    var noResults = document.getElementsByClassName("no-search-results")[0];

    if (!isEverywhereChecked && !isTitleChecked && !isDescChecked) {
        return;
    }

    if (isTitleChecked) {
        for (var i = 0; i < box.length; i++) {
            var titleItem = box[i].getElementsByClassName("content-title")[0];
            if (titleItem.innerHTML.toUpperCase().indexOf(filter) > -1) {
                box[i].style.display = "";
                box[i].classList.add("page-list-elem");
            } else {
                box[i].style.display = "none";
                box[i].classList.remove("page-list-elem");
            }
        }
    } else if (isDescChecked) {
        for (var j = 0; j < box.length; j++) {
            var descItem = box[j].getElementsByClassName("content-description")[0];
            if (descItem.innerHTML.toUpperCase().indexOf(filter) > -1) {
                box[j].style.display = "";
                box[j].classList.add("page-list-elem");
            } else {
                box[j].style.display = "none";
                box[j].classList.remove("page-list-elem");
            }
        }
    } else if (isEverywhereChecked) {
        for (var k = 0; k < box.length; k++) {
            var titleItem = box[k].getElementsByClassName("content-title")[0];
            var descItem = box[k].getElementsByClassName("content-description")[0];
            if (titleItem.innerHTML.toUpperCase().indexOf(filter) > -1 || descItem.innerHTML.toUpperCase().indexOf(filter) > -1) {
                box[k].style.display = "";
                box[k].classList.add("page-list-elem");
            } else {
                box[k].style.display = "none";
                box[k].classList.remove("page-list-elem");
            }
        }
    }

    if (resultsLength == 0) {
        noResults.style.display = "block";
        noResults.innerHTML = "No results found for " + input.value;
        document.getElementById("page-nav-position").style.display = "none";
    } else {
        noResults.style.display = "none";
        document.getElementById("page-nav-position").style.display = "";
    }

    pager.init();
    pager.showPage(1);
});


// filter content
document.getElementById("sort-list").addEventListener("change", function () {
    var switching = true;
    var shouldSwitch = true;
    var selectValue = this.value;
    var content = document.getElementsByClassName("content");
    var sortList;

    if (selectValue == "") {
        return;
    } else if (selectValue == "rating") {
        sortList = document.getElementsByClassName("js-rating-sort");
    } else if (selectValue == "votes") {
        sortList = document.getElementsByClassName("js-votes-sort");
    } else if (selectValue == "title") {
        sortList = document.getElementsByClassName("content-title");
    }

    while (switching) {
        switching = false;

        for (var i = 0; i < sortList.length - 1 ; i++) {
            shouldSwitch = false;
            if (selectValue == "rating" || selectValue == "votes") {
                if (Number(sortList[i].innerHTML) < Number(sortList[i + 1].innerHTML)) {
                    shouldSwitch = true;
                    break;
                }
            } else {
                if (sortList[i].innerHTML.toLowerCase() > sortList[i + 1].innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }

        if (shouldSwitch) {
            content[i].parentNode.insertBefore(content[i + 1], content[i]);
            switching = true;
        }
    }
    pager.init();
    pager.showPage(1);
});


function initMap() {
    var office = { lat: 40.768029, lng: -73.981847 };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: office,
        scrollwheel: false
    });
    var marker = new google.maps.Marker({
        position: office,
        map: map
    });
}


// hide or show map
document.getElementById("js-show-map").addEventListener("click", function (event) {
    var map = document.getElementById("map");
    if (map.style.display == "block") {
        map.style.display = "none";
    } else {
        map.style.display = "block";
    }
    initMap();
});



