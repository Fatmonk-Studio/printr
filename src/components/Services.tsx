import servicePrints from "@/assets/services/print.jpg";
import serviceFrames from "@/assets/services/frame.jpg";
import serviceCollages from "@/assets/services/collage.jpg";
import serviceAlbums from "@/assets/services/album.jpg";
import servicePlanner from "@/assets/services/planner.jpg";
import serviceMug from "@/assets/services/mug.jpg";
import serviceTshirt from "@/assets/services/tshirt.jpg";
import serviceBag from "@/assets/services/bag.jpg";
import { toast } from "sonner";

interface ServicesProps {
  onProductSelect?: (productId: string) => void;
}

export const Services = ({ onProductSelect }: ServicesProps) => {
  const handleComingSoon = () => {
    toast.info("Coming Soon!", {
      description: "This product will be available soon. Stay tuned!",
    });
  };

  return (
    <div className="bg-white dark:bg-black py-10">
      <div className="lg:w-[1180px] lg:mx-auto">
        <h1 className="text-5xl text-center font-semibold text-black dark:text-white leading-[35px] md:leading-[70px] mb-10">
          Our Services
        </h1>
        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 lg:gap-4 gap-3 lg:p-0 p-4">
          <button
            type="button"
            onClick={() => onProductSelect?.("print")}
            className="card bg-[#FFFFFF] dark:bg-[#1f1f1f] border-[1px] border-[#CECECE] dark:border-[#4a4a4a] w-full shadow-sm rounded-lg text-left hover:shadow-lg transition-shadow"
          >
            <figure className="px-4 pt-4">
              <img
                src={servicePrints}
                alt="Print Photos"
                className="rounded-xl w-full"
              />
            </figure>
            <div className="card-body py-4 items-center text-center">
              <h2 className="card-title text-2xl font-bold text-[#2D2D2D] dark:text-[#f5f5f5]">
                Print Photos
              </h2>
              <p className="text-[#6C6F89] dark:text-[#a0a3b1] text-sm font-normal">
                Superior quality printing, the way it <br></br>should be.
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onProductSelect?.("frame")}
            className="card bg-[#FFFFFF] dark:bg-[#1f1f1f] border-[1px] border-[#CECECE] dark:border-[#4a4a4a] w-full shadow-sm rounded-lg text-left hover:shadow-lg transition-shadow"
          >
            <figure className="px-4 pt-4">
              <img
                src={serviceFrames}
                alt="Frame Photos"
                className="rounded-xl w-full"
              />
            </figure>
            <div className="card-body py-4 items-center text-center">
              <h2 className="card-title text-2xl font-bold text-[#2D2D2D] dark:text-[#f5f5f5]">
                Frame Photos
              </h2>
              <p className="text-[#6C6F89] dark:text-[#a0a3b1] text-sm font-normal">
                High quality frames for your <br></br> photos
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onProductSelect?.("collage")}
            className="card bg-[#FFFFFF] dark:bg-[#1f1f1f] border-[1px] border-[#CECECE] dark:border-[#4a4a4a] w-full shadow-sm rounded-lg text-left hover:shadow-lg transition-shadow"
          >
            <figure className="px-4 pt-4">
              <img
                src={serviceCollages}
                alt="Custom Photo Collages"
                className="rounded-xl w-full"
              />
            </figure>
            <div className="card-body py-4 items-center text-center">
              <h2 className="card-title text-2xl font-bold text-[#2D2D2D] dark:text-[#f5f5f5]">
                Custom Photo Collages
              </h2>
              <p className="text-[#6C6F89] dark:text-[#a0a3b1] text-sm font-normal">
                Beautiful collages to hang on <br></br> your wall
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onProductSelect?.("album")}
            className="card bg-[#FFFFFF] dark:bg-[#1f1f1f] border-[1px] border-[#CECECE] dark:border-[#4a4a4a] w-full shadow-sm rounded-lg text-left hover:shadow-lg transition-shadow"
          >
            <figure className="px-4 pt-4">
              <img
                src={serviceAlbums}
                alt="Custom Photo Albums"
                className="rounded-xl w-full"
              />
            </figure>
            <div className="card-body py-4 items-center text-center">
              <h2 className="card-title text-2xl font-bold text-[#2D2D2D] dark:text-[#f5f5f5]">
                Custom Photo Albums
              </h2>
              <p className="text-[#6C6F89] dark:text-[#a0a3b1] text-sm font-normal">
                Quality photo albums to keep your <br></br> memories safe
              </p>
            </div>
          </button>

          {/* New and Coming Soon Services */}
          <button
            type="button"
            onClick={() => onProductSelect?.("planner")}
            className="card bg-[#FFFFFF] dark:bg-[#1f1f1f] border-[1px] border-[#CECECE] dark:border-[#4a4a4a] w-full shadow-sm rounded-lg text-left hover:shadow-lg transition-shadow"
          >
            <figure className="px-4 pt-4">
              <img
                src={servicePlanner}
                alt="Planner"
                className="rounded-xl w-full"
              />
            </figure>
            <div className="card-body py-4 items-center text-center">
              <h2 className="card-title text-2xl font-bold text-[#2D2D2D] dark:text-[#f5f5f5]">
                Planner
              </h2>
              <p className="text-[#6C6F89] dark:text-[#a0a3b1] text-sm font-normal">
                Personalized planners with custom <br></br> photo covers
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onProductSelect?.("mug")}
            className="card bg-[#FFFFFF] dark:bg-[#1f1f1f] border-[1px] border-[#CECECE] dark:border-[#4a4a4a] w-full shadow-sm rounded-lg text-left hover:shadow-lg transition-shadow relative"
          >
            <figure className="px-4 pt-4">
              <img
                src={serviceMug}
                alt="Print Mug"
                className="rounded-xl w-full opacity-75"
              />
            </figure>
            <div className="card-body py-4 items-center text-center">
              <h2 className="card-title text-2xl font-bold text-[#2D2D2D] dark:text-[#f5f5f5]">
                Print Mug
              </h2>
              <p className="text-[#6C6F89] dark:text-[#a0a3b1] text-sm font-normal">
                Custom printed mugs with your <br></br> favorite photos
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onProductSelect?.("tshirt")}
            className="card bg-[#FFFFFF] dark:bg-[#1f1f1f] border-[1px] border-[#CECECE] dark:border-[#4a4a4a] w-full shadow-sm rounded-lg text-left hover:shadow-lg transition-shadow relative"
          >
            <figure className="px-4 pt-4">
              <img
                src={serviceTshirt}
                alt="T-shirt Print"
                className="rounded-xl w-full opacity-75"
              />
            </figure>
            <div className="card-body py-4 items-center text-center">
              <h2 className="card-title text-2xl font-bold text-[#2D2D2D] dark:text-[#f5f5f5]">
                T-shirt Print
              </h2>
              <p className="text-[#6C6F89] dark:text-[#a0a3b1] text-sm font-normal">
                Personalized t-shirts with custom <br></br> photo prints
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onProductSelect?.("totebag")}
            className="card bg-[#FFFFFF] dark:bg-[#1f1f1f] border-[1px] border-[#CECECE] dark:border-[#4a4a4a] w-full shadow-sm rounded-lg text-left hover:shadow-lg transition-shadow relative"
          >
            <figure className="px-4 pt-4">
              <img
                src={serviceBag}
                alt="Tote Bag"
                className="rounded-xl w-full opacity-75"
              />
            </figure>
            <div className="card-body py-4 items-center text-center">
              <h2 className="card-title text-2xl font-bold text-[#2D2D2D] dark:text-[#f5f5f5]">
                Tote Bag
              </h2>
              <p className="text-[#6C6F89] dark:text-[#a0a3b1] text-sm font-normal">
                Stylish tote bags with your <br></br> custom designs
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
