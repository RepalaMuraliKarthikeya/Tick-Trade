export type Ticket = {
  id: string;
  movieName: string;
  theaterName: string;
  location: string;
  dateTime: string; // ISO 8601 format
  ticketCount: number;
  ticketPrice: number;
  posterImageUrl: string;
  imageHint?: string;
  postedBy: string; // userId
  status: 'available' | 'sold';
};

export type User = {
  id: string; // This will be the Firebase UID
  name?: string | null;
  email?: string | null;
};
