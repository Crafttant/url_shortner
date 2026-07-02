import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import API from "../api/axios";

// Consolidates URL table manipulation queries and hooks up hot toast feedbacks
export function useURLMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["urls"] });
    queryClient.invalidateQueries({ queryKey: ["allUrls"] });
    queryClient.invalidateQueries({ queryKey: ["globalAnalytics"] });
  };

  const favoriteMutation = useMutation({
    mutationFn: async (shortId) => {
      const response = await API.patch(`/url/${shortId}/favorite`);
      return response.data;
    },
    onSuccess: (data) => {
      invalidate();
      toast.success(data.isFavorite ? "Added to favorites!" : "Removed from favorites!");
    },
    onError: () => {
      toast.error("Failed to update favorite status.");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (shortId) => {
      const response = await API.patch(`/url/${shortId}/archive`);
      return response.data;
    },
    onSuccess: (data) => {
      invalidate();
      toast.success(data.isArchived ? "URL archived!" : "URL unarchived!");
    },
    onError: () => {
      toast.error("Failed to update archive status.");
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ shortId, redirectURL, expiresAt }) => {
      const response = await API.put(`/url/${shortId}`, { redirectURL, expiresAt });
      return response.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Link configurations updated!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Failed to edit URL details.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (shortId) => {
      const response = await API.delete(`/url/${shortId}`);
      return response.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("URL deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete shortened link.");
    },
  });

  return {
    favoriteMutation,
    archiveMutation,
    editMutation,
    deleteMutation,
  };
}
