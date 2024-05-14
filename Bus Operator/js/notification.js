import firebaseConfig from '/CONFIG.js';
import { DBPaths } from '/Bus Operator/js/DB.js';

const database = firebase.database();


document.addEventListener('DOMContentLoaded', generateNotifs);

// function generateNotifs() {

//     const notifRef = database.ref(`${DBPaths.LOGIN_NOTIF}`);

//     notifRef.orderByChild('role').equalTo('operator').once('value',
//         (snapshot) => {
//             const notifsArray = [];
//             snapshot.forEach((notif) => {

//                 const key = notif.key;
//                 const data = notif.val();
//                 data["key"] = key;
//                 notifsArray.push(data);
//             });

//             const reversedArray = notifsArray.reverse();
//             reversedArray.forEach((notif) => {
//                 createNotifItem(notif.fullName);
//             });

//         }
//     )

// }