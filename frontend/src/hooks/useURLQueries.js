import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

// Query paginated, filtered, and sorted shortened URLs
export function useURLs({ page, limit, search, filter, sort }) {
  return useQuery({
    queryKey: ["urls", { page, limit, search, filter, sort }],
    queryFn: async () => {
      const response = await API.get("/", {
        params: {
          page,
          limit,
          search,
          filter,
          sort,
        },
      });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
    refetchInterval: 3000,
  });
}

// Query all user URLs for aggregate counters and sidebars
export function useAllURLs() {
  return useQuery({
    queryKey: ["allUrls"],
    queryFn: async () => {
      const response = await API.get("/", {
        params: { limit: 1000, filter: "all" },
      });
      return response.data?.urls || [];
    },
    refetchInterval: 3000,
  });
}
