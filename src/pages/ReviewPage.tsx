import Footer from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import Review from "@/components/Review";
import { useQuery } from "@tanstack/react-query";

const ReviewPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const response = await fetch(
        "https://admin.printr.store/api/review-rating/list",
      );
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to load reviews");
      }

      return result.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return (
    <div>
      <Navigation />
      <div className="bg-white dark:bg-black py-10 pt-32 min-h-screen">
        <h1 className="text-3xl lg:text-[50px] font-medium text-[#222D39] dark:text-white text-center pb-3 lg:pb-7">
          See What Others Have to Say About Us
        </h1>
        <div className="lg:w-[1180px] lg:mx-auto px-4">
          {isLoading ? (
            <p className="text-center text-white dark:text-white">
              Loading reviews...
            </p>
          ) : error instanceof Error ? (
            <p className="text-center text-monkdeepred">{error.message}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data?.map((review) => (
                <Review key={review.id} data={review} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReviewPage;
