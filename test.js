// const { OpenAI } = require("openai");

// (async () => {
//   try {
//     let partition =
//       '("greeting": "Welcome, friend!")("farewell": "Goodbye, until next time")("thank_you": "Thank you for your support")("error_message": "An error occurred. Please try again.")("success_message": "Operation successful!")("settings_title": "Settings")("profile_title": "Profile")("notification_title": "Notifications")("search_hint": "Search for something...")("cancel": "Cancel")("save_changes": "Save Changes")("language": "Language")("theme": "Theme")("dark_mode": "Dark Mode")("light_mode": "Light Mode")("enable_notifications": "Enable Notifications")("notifications_on": "Notifications On")("notifications_off": "Notifications Off")("edit_profile": "Edit Profile")("logout": "Logout")("no_results": "No results found")("loading": "Loading...")("internet_connection": "No internet connection")("retry": "Retry")("forgot_password": "Forgot Password?")("reset_password": "Reset Password")("change_password": "Change Password")("new_password": "New Password")("confirm_password": "Confirm Password")("password_mismatch": "Passwords do not match")("invalid_email": "Invalid email address")("email_sent": "Email sent successfully")("welcome_back": "Welcome back!")("continue": "Continue")("take_tour": "Take a Tour")("feedback": "Send Feedback")("report_bug": "Report a Bug")("submit": "Submit")("about_us": "About Us")("contact_us": "Contact Us")("privacy_policy": "Privacy Policy")("terms_of_service": "Terms of Service")("rate_app": "Rate this App")("share_app": "Share this App")("follow_us": "Follow Us")("check_updates": "Check for Updates")("your_cart": "Your Cart")("total_amount": "Total Amount")("checkout": "Checkout")("order_summary": "Order Summary")';

//     const openai = new OpenAI({
//       apiKey: "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",
//     });

//     console.log("Starting..");

//     let res = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You're a professional localizer for key-value pairs, all key-pairs are separated with brackets, localize them and return the localized output in the same structure & format as the input",
//         },
//         { role: "user", content: "Translate this to fr: " + partition },
//       ],
//     });

//     console.log(res.choices);
//   } catch (error) {
//     console.log(error);
//   }
// })();

// (() => {
//   try {
//     let string =
//       '("greeting": "Bienvenue, ami!")("farewell": "Au revoir, à la prochaine")("thank_you": "Merci pour votre soutien")("error_message": "Une erreur est survenue. Veuillez réessayer.")("success_message": "Opération réussie!")("settings_title": "Paramètres")("profile_title": "Profil")("notification_title": "Notifications")("search_hint": "Recherchez quelque chose...")("cancel": "Annuler")("save_changes": "Enregistrer les modifications")("language": "Langue")("theme": "Thème")("dark_mode": "Mode sombre")("light_mode": "Mode clair")("enable_notifications": "Activer les notifications")("notifications_on": "Notifications activées")("notifications_off": "Notifications désactivées")("edit_profile": "Modifier le profil")("logout": "Se déconnecter")("no_results": "Aucun résultat trouvé")("loading": "Chargement...")("internet_connection": "Pas de connexion internet")("retry": "Réessayer")("forgot_password": "Mot de passe oublié ?")("reset_password": "Réinitialiser le mot de passe")("change_password": "Changer le mot de passe")("new_password": "Nouveau mot de passe")("confirm_password": "Confirmer le mot de passe")("password_mismatch": "Les mots de passe ne correspondent pas")("invalid_email": "Adresse email invalide")("email_sent": "Email envoyé avec succès")("welcome_back": "Bienvenue de retour!")("continue": "Continuer")("take_tour": "Faire une visite")("feedback": "Envoyer des commentaires")("report_bug": "Signaler un bogue")("submit": "Envoyer")("about_us": "À propos de nous")("contact_us": "Nous contacter")("privacy_policy": "Politique de confidentialité")("terms_of_service": "Conditions d\'utilisation")("rate_app": "Évaluer cette application")("share_app": "Partager cette application")("follow_us": "Suivez-nous")("check_updates": "Vérifier les mises à jour")("your_cart": "Votre panier")("total_amount": "Montant total")("checkout": "Paiement")("order_summary": "Récapitulatif de la commande")';

//     let replacedSymbols = string
//       .replaceAll("(", "")
//       .replaceAll(")", "")
//       .replaceAll("\n", "")
//       .replaceAll('""', '"\n"');

//     let asLines = replacedSymbols.split("\n");

//     for (let index = 0; index < asLines.length - 1; index++) {
//       asLines[index] = asLines[index] + ", ";
//     }

//     let asStringifedJson = "{" + asLines.join("\n") + "}";

//     console.log(JSON.parse(asStringifedJson));
//   } catch (error) {
//     console.log("can't be decoded");
//   }
// })();

// async function _makeOpenAIRequest(messageToOpenAI) {
//   const openai = new OpenAI({
//     apiKey: "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",
//   });

//   try {
//     let res = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: messageToOpenAI }],
//     });

//     return res.choices[0].message.content;
//   } catch (error) {
//     if (error.status === 429) {
//       await new Promise((resolve) => setTimeout(resolve, 20 * 1000));
//       return await _makeOpenAIRequest(messageToOpenAI);
//     } else {
//       throw error;
//     }
//   }
// }

// (async () => {
//   for (let index = 0; index < 10; index++) {
//     let r = await _makeOpenAIRequest("say random number from 1 to 1000");
//     console.log(r);
//   }
// })();

console.log(String.raw`hello,\n{}`);
