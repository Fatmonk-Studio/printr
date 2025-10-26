import servicePrints from "@/assets/services/print.jpg";
import serviceFrames from "@/assets/services/frame.jpg";
import serviceCollages from "@/assets/services/collage.jpg";
import serviceAlbums from "@/assets/services/album.jpg";
import { Link } from "react-router-dom";



export const Services = () => {
  return (
     <div className="bg-white dark:bg-black py-10">
            <div className="lg:w-[1180px] lg:mx-auto">
                <h1 className="text-5xl text-center font-semibold text-black dark:text-white leading-[35px] md:leading-[70px] mb-10">
                    Our Services
                </h1>
                <div className="grid lg:grid-cols-4 lg:gap-4 gap-3 lg:p-0 p-4">
                    <Link
                        to="/print"
                        className="card bg-[#FFFFFF] dark:bg-[#1f1f1f] border-[1px] border-[#CECECE] dark:border-[#4a4a4a] w-full shadow-sm rounded-lg"
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
                    </Link>
                    <Link
                        to="/frame"
                        className="card bg-[#FFFFFF] dark:bg-[#1f1f1f] border-[1px] border-[#CECECE] dark:border-[#4a4a4a] w-full shadow-sm rounded-lg"
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
                    </Link>
                    <Link
                        to="/photo-collage"
                        className="card bg-[#FFFFFF] dark:bg-[#1f1f1f] border-[1px] border-[#CECECE] dark:border-[#4a4a4a] w-full shadow-sm rounded-lg"
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
                    </Link>
                    <Link
                        to="/photo-album"
                        className="card bg-[#FFFFFF] dark:bg-[#1f1f1f] border-[1px] border-[#CECECE] dark:border-[#4a4a4a] w-full shadow-sm rounded-lg"
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
                    </Link>
                </div>
            </div>
        </div>
  );
};
