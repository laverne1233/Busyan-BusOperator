import { convertToPascal } from '/Bus Operator/utils/Utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const menuLinks = document.querySelectorAll('.sidebar ul li');
    menuLinks.forEach(link => {
        const aTag = link.querySelector('a');
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const className = aTag.getAttribute('data-target');
            showContent(className);
        });
    });

     // Get all the <li> elements
     const liElements = document.querySelectorAll("#sidebarUl li");

     // Loop through each <li> element and add a click event listener
     liElements.forEach(function(li) {
         li.addEventListener("click", function(event) {
             // Prevent the default behavior of the link
             event.preventDefault();
 
             // Get the data-target attribute value
             const target = this.querySelector("a").getAttribute("data-target");
 
             // List of valid targets and their corresponding HTML files
             const validTargets = {
                 "dashboard": "dashboard.html",
                 "notification": "notification.html",
                 "manage-bus": "manage-bus.html",
                 "manage-people": "manage-people.html",
                 "bus-schedule": "bus-schedule.html",
                 "manage-job": "manage-job.html",
                 "applicants": "applicants.html",
                 "profile": "profile.html",
                 "about-us": "about-us.html",
                 "help-center": "help-center.html"
             };
 
             // Check if the target is in the list of valid targets
             if (validTargets.hasOwnProperty(target)) {
                 // Navigate to the corresponding HTML file
                 window.location.href = validTargets[target];
             } else {
                 console.error("Invalid target:", target);
             }
         });
     });
});

function showContent(contentClassName) {
    const contentSections = document.querySelectorAll('.content-container > div');
    contentSections.forEach(section => {
        section.style.display = 'none';
    });

    const selectedContent = document.querySelector(`.${contentClassName}`);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }

   
}

function handleMenuItemClick(event) {
    const menuItems = document.querySelectorAll('.sidebar ul li');
    menuItems.forEach(item => {
        item.classList.remove('selected-menu');
    });

    const menuIcons = document.querySelectorAll('.sidebar li i');
    menuIcons.forEach(icon => {
        icon.classList.remove('selected-menu-text');
    });

    const menuTexts = document.querySelectorAll('.sidebar li span');
    menuTexts.forEach(text => {
        text.classList.remove('selected-menu-text');
    });

    const clickedMenuItem = event.currentTarget;
    clickedMenuItem.classList.add('selected-menu');

    const iTag = clickedMenuItem.querySelector('i');
    if (iTag) {
        iTag.classList.add('selected-menu-text');
    }

    const spanText = clickedMenuItem.querySelector('span');
    if (spanText) {
        spanText.classList.add('selected-menu-text');
    }
}

window.onload = function() {
    fillUserData();
};

export function fillUserData( ) {
    const myData = JSON.parse(sessionStorage.getItem('currentUser'));

    if (myData === undefined || myData === null) {
        window.location.href = './../../login.html';
    }

    // if (!userDetail) {
    //     console.error('User detail section not found.');
    //     return;
    // }

    // Select the elements in the user detail section
    const userDetail = document.querySelector('.user-detail');
    const imgElement = userDetail.querySelector('img');
    const usernameLabel = userDetail.querySelector('label:nth-of-type(1)');
    const roleLabel = userDetail.querySelector('label:nth-of-type(2)');
    const imgPlaceHolder = './images/profile.png';
    const companyNameElement = document.querySelector('.sidebar h3');
    const companyAddressElement = document.querySelector('.company-address-text');
    const companyDescriptionElement = document.querySelector('.company-description-text');

    console.log("myData:", myData);

    if (imgElement) {
        imgElement.src = myData.userImgSrc || imgPlaceHolder;
    } else {
        console.error("Image element not found.");
    }

    if (usernameLabel) {
        usernameLabel.textContent = convertToPascal(myData.fullName);
    } else {
        console.error("Username label not found.");
    }

    if (companyNameElement) {
        companyNameElement.textContent = myData.companyName || 'Unknown Company';
    } else {
        console.error("Company name element not found.");
    }

    // Set the values
    imgElement.src = myData.imageUrl || imgPlaceHolder;
    usernameLabel.textContent = convertToPascal(myData.fullName);
    roleLabel.textContent = 'Bus Operator';

    if (companyAddressElement) {
        companyAddressElement.textContent = myData.companyAddress || 'Unknown Address';
    } else {
        console.error("Company address element not found.");
    }

    
    if (companyDescriptionElement) {
        companyDescriptionElement.textContent = myData.companyDescription || 'No description available';
    } else {
        console.error("Company description element not found.");
    }

    console.log("Company Address:", myData.companyAddress);
    console.log("Company Description:", myData.companyDescription);

}