import config from "../../config/config";

export const validateSurveyAccess = async (survey, userId, userDetails, authToken) => {
  // Check 1: Preferred participants validation
  const [faculty, department] = survey.preferred_participants;
  
  if (faculty !== "All Faculties") {
    if (faculty !== userDetails.faculty) {
      throw new Error("You are not from the preferred faculty for this survey");
    }
    if (department !== "All Departments" && department !== userDetails.department) {
      throw new Error("You are not from the preferred department for this survey");
    }
  }

  // Check 2: Gender validation
  if (survey.gender !== "all_genders" && survey.gender !== userDetails.gender) {
    throw new Error("This survey is only for " + survey.gender + " participants");
  }

  // Check 3: Max participants validation
  if (survey.participantCounts.filled >= survey.no_of_participants) {
    throw new Error("This survey has reached its maximum number of participants");
  }

  // Check 4: Previous participation check
  const API_URL = `${config.API_URL}/surveys/${survey._id}/user-submitted`;
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  
  const data = await response.json();
  console.log(data)
  if (data.submitted === true) {
    throw new Error("You have already participated in this survey");
  }

  return true;
}; 