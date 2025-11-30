export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "UCLan Find Me A Room",
  description:
    "Find an available room right now on the UCLan Preston Campus, using filters to find a room that suits your needs",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Room Search",
      href: "/rooms",
    },
    {
      title: "Building Search",
      href: "/buildings",
    },
    {
      title: "Lecturer Search",
      href: "/lecturers",
    },
    {
      title: "Module Search",
      href: "/modules",
    },
    {
      title: "Course Timetable",
      href: "/course-timetable",
    },
  ],
  links: {
    github: "https://github.com/DaKheera47/find_me_a_room_nova",
    author: "https://shaheersarfaraz.promirage.com/",
  },
};
