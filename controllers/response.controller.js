
import { responseService } from "../services/response.service";
class ResponseController {
  async submitResponse(req, res) {
    try {
      const response = await responseService.submitResponse(
        req.params.formId,
        req.body.answers
      );
      res.status(201).json(response);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getResponses(req, res) {
    try {
      const responses = await responseService.getResponses(req.params.formId);
      res.json(responses);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export const responseController  = new ResponseController();
