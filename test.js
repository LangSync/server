const { OpenAI } = require("openai");

(async () => {
  try {
    let partition =
      '("greeting": "Welcome, friend!")("farewell": "Goodbye, until next time")("thank_you": "Thank you for your support")("error_message": "An error occurred. Please try again.")("success_message": "Operation successful!")("settings_title": "Settings")("profile_title": "Profile")("notification_title": "Notifications")("search_hint": "Search for something...")("cancel": "Cancel")("save_changes": "Save Changes")("language": "Language")("theme": "Theme")("dark_mode": "Dark Mode")("light_mode": "Light Mode")("enable_notifications": "Enable Notifications")("notifications_on": "Notifications On")("notifications_off": "Notifications Off")("edit_profile": "Edit Profile")("logout": "Logout")("no_results": "No results found")("loading": "Loading...")("internet_connection": "No internet connection")("retry": "Retry")("forgot_password": "Forgot Password?")("reset_password": "Reset Password")("change_password": "Change Password")("new_password": "New Password")("confirm_password": "Confirm Password")("password_mismatch": "Passwords do not match")("invalid_email": "Invalid email address")("email_sent": "Email sent successfully")("welcome_back": "Welcome back!")("continue": "Continue")("take_tour": "Take a Tour")("feedback": "Send Feedback")("report_bug": "Report a Bug")("submit": "Submit")("about_us": "About Us")("contact_us": "Contact Us")("privacy_policy": "Privacy Policy")("terms_of_service": "Terms of Service")("rate_app": "Rate this App")("share_app": "Share this App")("follow_us": "Follow Us")("check_updates": "Check for Updates")("your_cart": "Your Cart")("total_amount": "Total Amount")("checkout": "Checkout")("order_summary": "Order Summary")';

    const openai = new OpenAI({
      apiKey: "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",
    });

    console.log("Starting..");

    let res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You're a professional localizer for key-value pairs, all key-pairs are separated with brackets, localize them and return the localized output in the same structure & format as the input",
        },
        { role: "user", content: "Translate this to fr: " + partition },
      ],
    });

    console.log(res.choices);
  } catch (error) {
    console.log(error);
  }
})();
