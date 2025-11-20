// import config from "../../config/config";
// import { toast } from "react-toastify";
// import { redirect } from "react-router-dom";
// import useAuthStore from "../../store/useAuthStore";

// const action = async ({ request }) => {
//   const authToken = localStorage.getItem("token");
//   const formData = await request.formData();
  
//   const form = {
//     title: formData.get("title"),
//     description: formData.get("description"),
//     fields: [],
//     shares: {
//       type: "public",
//       emails: [],
//       userIds: []
//     }
//   };

//   const API_URL = `${config.API_URL}/forms`;
//   const options = {
//     body: JSON.stringify(form),
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Allow-Control-Allow-Origin": "*",
//       "Authorization": `Bearer ${authToken}`
//     },
//   };

//   try {
//     const response = await fetch(API_URL, options);
//     const json = await response.json();
    
//     console.log("Form creation response:", json);
    
//     if (response.ok) {
//       toast.success("Form created successfully!");
//       const formId = json.form?._id || json._id || json.data?.form?._id || json.data?._id;
      
//       if (!formId) {
//         console.error("No form ID in response:", json);
//         toast.error("Form created but no ID returned. Please check the response.");
//         return { error: true };
//       }
      
//       // Store form ID in Zustand store
//       const { setFormId } = useAuthStore.getState();
//       setFormId(formId);
      
//       // Redirect to form questions page
//       return redirect('/formquestions');
//     } else {
//       const errorMsg = json.msg || json.message || "Failed to create form";
//       console.error("Form creation failed:", json);
//       toast.error(errorMsg);
//       return { error: true, message: errorMsg };
//     }
//   } catch (error) {
//     console.error("Error creating form:", error);
//     toast.error("An error occurred. Please try again.");
//     return { error: true, message: error.message };
//   }
// };

// export default action;

import { redirect } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const action = async ({ request }) => {
  const formData = await request.formData();

  // Store title and description in Zustand (don't submit to backend yet)
  const { setFormDraft, clearFormDraft } = useAuthStore.getState();
  
  // Clear any previous draft first
  clearFormDraft();
  
  // Store step 1 data (title & description)
  setFormDraft({
    title: formData.get("title") || "",
    description: formData.get("description") || "",
  });

  // Redirect to form questions page (step 2)
  return redirect("/formquestions");
};

export default action;
