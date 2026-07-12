// Temporary mock data for analytics testing
// TODO: Remove when backend is ready

export const mockAnalyticsSurveys = [
    {
      _id: "survey1",
      title: "Student Housing Feedback",
      createdAt: "2026-03-01T10:00:00Z",
      no_of_participants: 50,
  
      submittedUsers: [
        { userId: "u1", submittedAt: "2026-03-02T09:00:00Z" },
        { userId: "u2", submittedAt: "2026-03-02T11:30:00Z" },
        { userId: "u3", submittedAt: "2026-03-03T08:15:00Z" },
        { userId: "u4", submittedAt: "2026-03-04T14:20:00Z" },
        { userId: "u5", submittedAt: "2026-03-05T10:00:00Z" },
      ],
    },
  
    {
      _id: "survey2",
      title: "Tech Skills Survey",
      createdAt: "2026-03-10T12:00:00Z",
      no_of_participants: 100,
  
      submittedUsers: [
        { userId: "u6", submittedAt: "2026-03-11T09:00:00Z" },
        { userId: "u7", submittedAt: "2026-03-12T10:30:00Z" },
        { userId: "u8", submittedAt: "2026-03-13T16:00:00Z" },
        { userId: "u9", submittedAt: "2026-03-14T12:45:00Z" },
        { userId: "u10", submittedAt: "2026-03-15T13:10:00Z" },
        { userId: "u11", submittedAt: "2026-03-16T08:50:00Z" },
      ],
    },
  
    {
      _id: "survey3",
      title: "Agriculture Research Survey",
      createdAt: "2026-02-20T08:00:00Z",
      no_of_participants: 75,
  
      submittedUsers: [
        { userId: "u12", submittedAt: "2026-02-21T09:00:00Z" },
        { userId: "u13", submittedAt: "2026-02-22T10:30:00Z" },
        { userId: "u14", submittedAt: "2026-02-23T12:00:00Z" },
      ],
    },
    // {
    //   _id: "survey4",
    //   title: "Agriculture Research Survey",
    //   createdAt: "2026-02-20T08:00:00Z",
    //   no_of_participants: 80,
  
    //   submittedUsers: [
    //     { userId: "u15", submittedAt: "2026-02-21T09:00:00Z" },
    //     { userId: "u16", submittedAt: "2026-02-22T10:30:00Z" },
    //     { userId: "u17", submittedAt: "2026-02-23T12:00:00Z" },
    //   ],
    // },
  ];