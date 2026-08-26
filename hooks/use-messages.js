import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorMessagesAPI } from "@/lib/api/vendor/messages";
import { showToast } from "@/components/shared/toast";

// Query keys.
//
// `useConversations`, `useMessages` and `useSendMessage` used to sit above the
// vendor hooks, backed by lib/mock/messages.js and unused by any page. They also
// declared `MESSAGES_QUERY_KEYS.messages(id)` — the same key
// `useVendorConversationMessages` uses, with a different queryFn. One key, two
// fetchers, whichever mounted first winning. Deleted with the fixture.
export const MESSAGES_QUERY_KEYS = {
  conversations: (filters) => ["messages", "conversations", filters],
  messages: (conversationId) => ["messages", "conversation", conversationId],
  vendorMessages: (filters) => ["vendor", "messages", filters],
};

// ===== Vendor Messages API Hooks (Real Backend) =====

/**
 * Helper function to transform flat messages into conversation groups
 * Groups messages by the "other party" (sender for inbound, recipient for outbound)
 */
function transformMessagesToConversations(messages) {
  const conversationMap = new Map();

  messages.forEach((message) => {
    // Determine the contact email (other party)
    const contactEmail =
      message.direction === "inbound" ? message.from : message.to;

    if (!conversationMap.has(contactEmail)) {
      // Extract name from email or use email
      const contactName = contactEmail.split("@")[0].replace(/[._-]/g, " ");
      const initials = contactName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      conversationMap.set(contactEmail, {
        id: contactEmail, // Use email as unique ID
        contactName: contactName.charAt(0).toUpperCase() + contactName.slice(1),
        contactEmail: contactEmail,
        contactInitials: initials,
        messages: [],
        lastMessage: "",
        timestamp: "",
        unread: false,
        status: "Active",
      });
    }

    const conversation = conversationMap.get(contactEmail);
    conversation.messages.push(message);

    // Update last message info
    if (
      !conversation.lastMessage ||
      new Date(message.createdAtUTC) >
        new Date(conversation.messages[0].createdAtUTC)
    ) {
      conversation.lastMessage = message.body;
      conversation.timestamp = formatTimestamp(message.createdAtUTC);
      conversation.unread = conversation.unread || !message.isRead;
    }
  });

  return Array.from(conversationMap.values());
}

/**
 * Helper function to format timestamp
 */
function formatTimestamp(dateString) {
  if (!dateString) return "Just now";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Just now"; // Invalid date

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  } catch (e) {
    console.warn("Invalid date format:", dateString);
    return "Just now";
  }
}

// Hook to fetch vendor messages with pagination
export function useVendorMessages(filters = {}) {
  const { page = 1, pageSize = 20, unreadOnly = false } = filters;

  return useQuery({
    queryKey: MESSAGES_QUERY_KEYS.vendorMessages({ page, pageSize, unreadOnly }),
    queryFn: async () => {
      const response = await vendorMessagesAPI.getMessages({
        page,
        pageSize,
        unreadOnly,
      });

      // Transform backend response to match expected frontend structure
      return {
        messages: response.items || [],
        pagination: {
          page,
          pageSize,
          total: response.totalCount || 0,
          totalPages: Math.ceil((response.totalCount || 0) / pageSize),
        },
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    keepPreviousData: true,
  });
}

// Hook to fetch conversations from vendor messages (transforms flat messages into conversations)
export function useVendorConversations(filters = {}) {
  const { filter = "active", search = "" } = filters;

  return useQuery({
    queryKey: MESSAGES_QUERY_KEYS.conversations({ filter, search, source: "vendor" }),
    queryFn: async () => {
      // Fetch all messages (or at least enough to group into conversations)
      const response = await vendorMessagesAPI.getMessages({
        page: 1,
        pageSize: 100, // Fetch more to ensure we get all conversations
        unreadOnly: filter === "unread" ? true : undefined,
      });

      const conversations = transformMessagesToConversations(
        response.items || []
      );

      // Apply search filter
      const filtered = search
        ? conversations.filter(
            (conv) =>
              conv.contactName.toLowerCase().includes(search.toLowerCase()) ||
              conv.contactEmail.toLowerCase().includes(search.toLowerCase()) ||
              conv.lastMessage.toLowerCase().includes(search.toLowerCase())
          )
        : conversations;

      // Apply status filter
      let statusFiltered = filtered;
      if (filter === "pending") {
        statusFiltered = filtered.filter((conv) => conv.unread);
      } else if (filter === "closed") {
        statusFiltered = []; // No closed concept yet
      }

      return {
        conversations: statusFiltered,
        counts: {
          active: conversations.length,
          pending: conversations.filter((c) => c.unread).length,
          closed: 0,
        },
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to fetch messages for a specific conversation (contact email)
export function useVendorConversationMessages(contactEmail) {
  return useQuery({
    queryKey: MESSAGES_QUERY_KEYS.messages(contactEmail),
    queryFn: async () => {
      // Fetch all messages
      const response = await vendorMessagesAPI.getMessages({
        page: 1,
        pageSize: 100,
      });

      // Filter messages for this specific contact
      const messages = (response.items || []).filter(
        (msg) =>
          (msg.direction === "inbound" && msg.from === contactEmail) ||
          (msg.direction === "outbound" && msg.to === contactEmail)
      );

      // Transform to expected format
      return messages.map((msg) => {
        // Handle timestamp safely
        let timestamp = "Just now";
        if (msg.createdAtUTC) {
          try {
            const date = new Date(msg.createdAtUTC);
            if (!isNaN(date.getTime())) {
              timestamp = date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              });
            }
          } catch (e) {
            console.warn("Invalid date format:", msg.createdAtUTC);
          }
        }

        return {
          id: msg.id,
          sender: msg.direction === "inbound" ? "customer" : "vendor",
          senderName: msg.direction === "inbound" ? contactEmail : "You",
          message: msg.body,
          subject: msg.subject,
          timestamp,
          initials:
            msg.direction === "inbound"
              ? contactEmail.split("@")[0].slice(0, 2).toUpperCase()
              : "Y",
          color: msg.direction === "inbound" ? "var(--color-success)" : "var(--color-info)",
        };
      });
    },
    enabled: !!contactEmail,
    staleTime: 10 * 1000, // 10 seconds
  });
}

// Hook to send a vendor message
export function useSendVendorMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageData) => vendorMessagesAPI.sendMessage(messageData),
    onSuccess: () => {
      // Invalidate all vendor messages queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["vendor", "messages"],
      });
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to send message"),
  });
}

// Hook to send a message in a conversation (wrapper that converts to vendor API format)
export function useSendConversationMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactEmail, message }) => {
      // Auto-generate subject from first line or first 50 characters
      const firstLine = message.split('\n')[0];
      const subject = firstLine.length > 50
        ? firstLine.substring(0, 47) + '...'
        : firstLine;

      return vendorMessagesAPI.sendMessage({
        subject: subject || "Message", // Fallback if somehow empty
        body: message,
        to: contactEmail,
      });
    },
    onSuccess: (_data, variables) => {
      // Invalidate conversation messages
      queryClient.invalidateQueries({
        queryKey: MESSAGES_QUERY_KEYS.messages(variables.contactEmail),
      });
      // Invalidate conversations list
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to send message"),
  });
}
