export interface PaperQuestion {
  id: string;

  paper_id: string;

  subject: string;
  college: string;
  branch: string;
  semester: number;
  year: number;

  extracted_text: string;

  is_processed: boolean;

  created_at: string;
}
