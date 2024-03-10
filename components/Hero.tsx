import { Button } from "./ui/button";
import { buttonVariants } from "./ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import CustomKBD from "./ui/kbd";
import { cn } from "@/lib/utils";
import { useCommandBarStore } from "@/store/commandBarStore";

export const Hero = () => {
  const { toggle } = useCommandBarStore();

  return (
    <section className="flex h-[calc(100vh-16rem)] items-center gap-10">
      <div className="w-full space-y-6 md:w-3/4 lg:text-start">
        <div className="text-5xl font-bold md:text-6xl">
          <p className="bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
            UCLan Find Me A Room
          </p>{" "}
          for students and staff
        </div>

        <p className="mt-4 text-xl">
          Press <CustomKBD>Cmd + K</CustomKBD> to search for a room directly.
        </p>

        <p className="mx-auto text-xl text-muted-foreground md:w-10/12 lg:mx-0">
          Check the current availability of rooms across the University of
          Central Lancashire Preston campus. Ideal for finding a quick study
          space or meeting room.
        </p>

        <div className="space-y-4 md:space-x-4 md:space-y-0">
          <Button className="w-full md:w-1/3" onClick={toggle}>
            Start Searching
          </Button>

          <a
            href="https://github.com/DaKheera47/find_me_a_room_nova"
            target="_blank"
            className={cn(
              "w-full md:w-1/3",
              buttonVariants({
                variant: "outline",
              }),
            )}
          >
            Github Repository
            <GitHubLogoIcon className="ml-2 size-5" />
          </a>
        </div>
      </div>
    </section>
  );
};
