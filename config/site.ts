export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Next.js",
  description:
    "Find an available room right now on the UCLan Preston Campus, using filters to find a room that suits your needs",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Room Search",
      href: "/room-availability-checker",
    },
    {
      title: "Building Search",
      href: "/find-free-room",
    },
  ],
  links: {
    github: "https://github.com/DaKheera47/find_me_a_room_nova",
    author: "https://shaheersarfaraz.promirage.com/",
  },
};
