// hooks/use-ai-services.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  aiProjectsApi,
  aiGenerationApi,
  aiUsageApi,
  aiAssistantApi,
  aiStylesApi,
  aiRenovationApi,
} from "@/lib/api/ai-services";
import { showToast } from "@/components/shared/toast";

// ─── Query key factory ────────────────────────────────────────────────────────
export const aiKeys = {
  projects: () => ["ai", "projects"],
  project: (id) => ["ai", "project", id],
  styles: () => ["ai", "styles"],
  usageSummary: () => ["ai", "usage", "summary"],
  creditBalance: () => ["ai", "credits", "balance"],
  toolAction: (id) => ["ai", "tool-action", id],
};

/**
 * GET /ai/styles — the selectable design styles.
 *
 * Public and effectively static, so it is cached for the session and needs no
 * `enabled` gate. `select` guarantees an array even if the backend ever wraps
 * it, so callers can always `.map` without a guard.
 */
export function useAIStyles() {
  return useQuery({
    queryKey: aiKeys.styles(),
    queryFn: aiStylesApi.getStyles,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    select: (res) => (Array.isArray(res) ? res : (res?.data ?? [])),
  });
}

// ─── AI Renovation Estimator ────────────────────────────────────────────────

/**
 * POST /ai/renovation/estimate — no query key, since a "get estimate" run
 * isn't a resource to cache or refetch; each submission is its own mutation.
 */
export function useCreateRenovationEstimate() {
  return useMutation({
    mutationFn: (data) => aiRenovationApi.createEstimate(data),
    onError: (error) =>
      showToast.error(error.message || "Failed to generate estimate"),
  });
}

// ─── AI Projects ──────────────────────────────────────────────────────────────

export function useUploadRoom() {
  return useMutation({
    mutationFn: (file) => aiProjectsApi.uploadRoom(file),
  });
}

export function useAIProjects() {
  return useQuery({
    queryKey: aiKeys.projects(),
    queryFn: aiProjectsApi.getProjects,
    staleTime: 2 * 60 * 1000,
    select: (res) => res?.data?.items ?? res?.data ?? res?.items ?? [],
  });
}

export function useCreateAIProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => aiProjectsApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.projects() });
    },
  });
}

// ─── AI Generation ────────────────────────────────────────────────────────────

export function useGenerateImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => aiGenerationApi.generateImage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.usageSummary() });
      queryClient.invalidateQueries({ queryKey: aiKeys.creditBalance() });
    },
  });
}

export function useTransformImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => aiGenerationApi.transformImage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.usageSummary() });
      queryClient.invalidateQueries({ queryKey: aiKeys.creditBalance() });
    },
  });
}

export function useGenerateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => aiGenerationApi.generateVideo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.usageSummary() });
      queryClient.invalidateQueries({ queryKey: aiKeys.creditBalance() });
    },
  });
}

// ─── AI Usage & Credits ───────────────────────────────────────────────────────

export function useAIUsageSummary() {
  return useQuery({
    queryKey: aiKeys.usageSummary(),
    queryFn: aiUsageApi.getUsageSummary,
    staleTime: 5 * 60 * 1000,
    select: (res) => res?.data ?? res,
  });
}

export function useAICreditBalance() {
  return useQuery({
    queryKey: aiKeys.creditBalance(),
    queryFn: aiUsageApi.getCreditBalance,
    staleTime: 2 * 60 * 1000,
    select: (res) => res?.data ?? res,
  });
}

// ─── AI Assistant Tool Actions ────────────────────────────────────────────────

export function useToolAction(actionId) {
  return useQuery({
    queryKey: aiKeys.toolAction(actionId),
    queryFn: () => aiAssistantApi.getToolAction(actionId),
    enabled: !!actionId,
    staleTime: 30 * 1000, // tool actions are short-lived
    select: (res) => res?.data ?? res,
  });
}
