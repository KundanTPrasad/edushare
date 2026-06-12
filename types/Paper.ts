export interface Paper {
  id: string;
  college: string;
  branch: string;
  semester: number;
  subject: string;
  year: number;

  resourceType: string;

  thumbnail: string;
  fileUrl: string;
  fileType: "pdf" | "image";

  rating?: number;
  views?: number;
}
