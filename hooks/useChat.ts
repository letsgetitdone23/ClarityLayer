import { useState } from 'react';
import { Chat, Message, ClarityData, ConfidenceFlag, Assumption } from '../lib/types';

function detectSearchNeed(message: string, isFollowUp: boolean): boolean {
  const text = message.toLowerCase();

  // Skip conversational messages
  if (text.includes('thanks') || text.includes('can you help me') || text === 'hi' || text === 'hello' || text === 'hey') {
    return false;
  }

  // Skip conceptual or creative requests
  if (
    text.includes('explain quantum physics') || 
    text.includes('write a poem') || 
    text.includes('help me structure this') ||
    text.includes('write a story')
  ) {
    return false;
  }

  // Skip follow-up messages that clearly refer to prior context
  if (isFollowUp && (text.startsWith('why ') || text.startsWith('how ') || text.includes('that') || text.includes('it') || text.length < 15)) {
    return false;
  }

  // Triggers
  const signals = [
    '2024', '2025', '2026', 'today', 'this week', 'latest', 'recent', 'now', 'currently',
    'what happened', 'news about', 'update on',
    'stock', 'price', 'rate', 'score',
    'who is the ceo', 'who won', 'who is'
  ];

  if (signals.some(sig => text.includes(sig))) {
    return true;
  }

  return false;
}

export function useChat() {
  const [chats, setChats] = useState<Chat[]>(() => [{
    id: Math.random().toString(36).substring(7),
    title: 'New conversation',
    messages: [],
    createdAt: new Date(),
  }]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(() => chats[0].id);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);

  const currentChat = chats.find(c => c.id === currentChatId) || null;
  const messages = currentChat ? currentChat.messages : [];

  const startNewChat = () => {
    if (currentChat && currentChat.messages.length === 0) return;

    const newChatId = Math.random().toString(36).substring(7);
    const newChat: Chat = {
      id: newChatId,
      title: 'New conversation',
      messages: [],
      createdAt: new Date(),
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setInputText('');
  };

  const selectChat = (id: string) => {
    setCurrentChatId(id);
  };

  const updateFlagFeedback = (messageId: string, flagId: string, feedback: 'verified' | 'not_helpful') => {
    setChats(prev => prev.map(c => {
      const hasMessage = c.messages.some(m => m.id === messageId);
      if (hasMessage) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === messageId && m.clarity) {
              return {
                ...m,
                clarity: {
                  ...m.clarity,
                  flags: m.clarity.flags.map(f => {
                    if (f.id === flagId) {
                      return { ...f, userFeedback: feedback };
                    }
                    return f;
                  })
                }
              };
            }
            return m;
          })
        };
      }
      return c;
    }));
  };

  const submitClarityFeedback = (messageId: string, feedback: 'helpful' | 'somewhat' | 'not_really') => {
    setChats(prev => prev.map(c => {
      const hasMessage = c.messages.some(m => m.id === messageId);
      if (hasMessage) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === messageId && m.clarity) {
              return {
                ...m,
                clarity: {
                  ...m.clarity,
                  feedbackGiven: feedback
                }
              };
            }
            return m;
          })
        };
      }
      return c;
    }));
  };

  const toggleEditingAssumption = (messageId: string, assumptionId: string, isEditing: boolean) => {
    setChats(prev => prev.map(c => {
      const hasMessage = c.messages.some(m => m.id === messageId);
      if (hasMessage) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === messageId && m.clarity) {
              return {
                ...m,
                clarity: {
                  ...m.clarity,
                  assumptions: m.clarity.assumptions.map(a => {
                    if (a.id === assumptionId) {
                      return { ...a, isEditing };
                    }
                    return isEditing ? { ...a, isEditing: false } : a;
                  })
                }
              };
            }
            return m;
          })
        };
      }
      return c;
    }));
  };

  const updateAssumption = (messageId: string, assumptionId: string, newText: string) => {
    setChats(prev => prev.map(c => {
      const hasMessage = c.messages.some(m => m.id === messageId);
      if (hasMessage) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === messageId && m.clarity) {
              return {
                ...m,
                clarity: {
                  ...m.clarity,
                  assumptions: m.clarity.assumptions.map(a => {
                    if (a.id === assumptionId) {
                      return { ...a, editedText: newText || undefined, isEditing: false };
                    }
                    return a;
                  })
                }
              };
            }
            return m;
          })
        };
      }
      return c;
    }));
  };

  const regenerateWithCorrections = async (messageId: string) => {
    if (!currentChatId) return;
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;

    const originalMessageIndex = chat.messages.findIndex(m => m.id === messageId);
    if (originalMessageIndex === -1) return;

    const originalMessage = chat.messages[originalMessageIndex];
    if (!originalMessage.clarity) return;

    // Collect edited assumptions (only those that were corrected)
    const corrections = originalMessage.clarity.assumptions
      .filter(a => a.editedText !== undefined && a.editedText !== '')
      .map(a => `User corrected assumption: '${a.text}' → '${a.editedText}'`);

    // Build history up to (and including) the user message immediately preceding the assistant message
    const history = chat.messages.slice(0, originalMessageIndex);

    // Find the original user prompt for this turn
    const lastUserMessage = history[history.length - 1];
    const userPromptText = lastUserMessage ? lastUserMessage.content : '';

    const willSearch = detectSearchNeed(userPromptText, originalMessageIndex > 1);
    if (willSearch) {
      setIsSearchingWeb(true);
    }
    setIsTyping(true);

    let accumulatedText = '';
    const assistantMsgId = Math.random().toString(36).substring(7);
    let searchPerformed = false;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: history,
          correctedAssumptions: corrections
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to reach chat API.");
      }

      if (!response.body) {
        throw new Error("Empty response body from chat API.");
      }

      searchPerformed = response.headers.get('x-search-performed') === 'true';
      setIsSearchingWeb(false);

      const initialAssistantMessage: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        isRegeneratedFrom: messageId, // Link new response to original
        searchPerformed,
      };

      // Append new assistant message to chat
      setChats(prev => prev.map(c => {
        if (c.id === currentChatId) {
          return {
            ...c,
            messages: [...c.messages, initialAssistantMessage],
          };
        }
        return c;
      }));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      setIsTyping(false);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          accumulatedText += chunk;

          setChats(prev => prev.map(c => {
            if (c.id === currentChatId) {
              return {
                ...c,
                messages: c.messages.map(m => {
                  if (m.id === assistantMsgId) {
                    return { ...m, content: accumulatedText };
                  }
                  return m;
                })
              };
            }
            return c;
          }));
        }
      }
    } catch (err: any) {
      console.error("Regeneration error:", err);
      setIsSearchingWeb(false);

      const errorMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: `Sorry, I encountered an error during regeneration: ${err.message || 'Unknown error'}.`,
        isRegeneratedFrom: messageId,
        searchPerformed: false,
      };

      setChats(prev => prev.map(c => {
        if (c.id === currentChatId) {
          return {
            ...c,
            messages: [...c.messages, errorMsg],
          };
        }
        return c;
      }));
      setIsTyping(false);
      return;
    }

    // Now trigger Clarity analysis for the regenerated response
    setChats(prev => prev.map(c => {
      if (c.id === currentChatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === assistantMsgId) {
              return {
                ...m,
                clarity: {
                  flags: [],
                  assumptions: [],
                  isLoading: true,
                }
              };
            }
            return m;
          })
        };
      }
      return c;
    }));

    try {
      const clarityResponse = await fetch('/api/clarity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responseText: accumulatedText,
          userPrompt: userPromptText,
          searchPerformed,
        }),
      });

      if (!clarityResponse.ok) {
        throw new Error("Clarity analysis API error.");
      }

      const clarityData = await clarityResponse.json();

      const flags: ConfidenceFlag[] = (clarityData.flags || []).map((f: any, index: number) => {
        const startIndex = accumulatedText.indexOf(f.sentence);
        return {
          id: f.id || `f-${index}-${Math.random().toString(36).substring(4)}`,
          sentence: f.sentence,
          reason: f.reason,
          confidence_level: f.confidence_level || 'moderate',
          verification_pointer: f.verification_pointer || '',
          depends_on: f.depends_on || null,
          startIndex: startIndex !== -1 ? startIndex : 0,
          endIndex: startIndex !== -1 ? startIndex + f.sentence.length : 0,
        };
      });

      const assumptions: Assumption[] = (clarityData.assumptions || []).map((a: any, index: number) => ({
        id: a.id || `a-${index}-${Math.random().toString(36).substring(4)}`,
        text: a.text,
        isEditing: false,
        isStatic: a.isStatic || false,
        impact: a.impact || 'low',
        suggestions: a.suggestions || [],
      }));

      setChats(prev => prev.map(c => {
        if (c.id === currentChatId) {
          return {
            ...c,
            messages: c.messages.map(m => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  clarity: {
                    flags,
                    assumptions,
                    isLoading: false,
                  }
                };
              }
              return m;
            })
          };
        }
        return c;
      }));
    } catch (clarityError) {
      console.error("Clarity error during regeneration:", clarityError);
      setChats(prev => prev.map(c => {
        if (c.id === currentChatId) {
          return {
            ...c,
            messages: c.messages.map(m => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  clarity: {
                    flags: [],
                    assumptions: [],
                    isLoading: false,
                    isError: true,
                  }
                };
              }
              return m;
            })
          };
        }
        return c;
      }));
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: text,
    };

    let targetChatId = currentChatId;
    let currentMessages = [...messages];

    // If somehow targetChatId is null
    if (!targetChatId) {
      targetChatId = Math.random().toString(36).substring(7);
      const title = text.length > 35 ? text.substring(0, 35) + '...' : text;
      const newChat: Chat = {
        id: targetChatId,
        title,
        messages: [userMessage],
        createdAt: new Date(),
      };
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(targetChatId);
      currentMessages = [userMessage];
    } else {
      // Append user message and update title if first message
      setChats(prev => prev.map(c => {
        if (c.id === targetChatId) {
          const isFirstMessage = c.messages.length === 0;
          const title = isFirstMessage ? (text.length > 35 ? text.substring(0, 35) + '...' : text) : c.title;
          return {
            ...c,
            title,
            messages: [...c.messages, userMessage],
          };
        }
        return c;
      }));
      currentMessages = [...currentMessages, userMessage];
    }

    setInputText('');
    const willSearch = detectSearchNeed(text, currentMessages.length > 1);
    if (willSearch) {
      setIsSearchingWeb(true);
    }
    setIsTyping(true);

    let accumulatedText = '';
    const assistantMsgId = Math.random().toString(36).substring(7);
    let searchPerformed = false;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: currentMessages }),
      });

      if (!response.ok) {
        throw new Error("Unable to reach chat API.");
      }

      if (!response.body) {
        throw new Error("Empty response body from chat API.");
      }

      searchPerformed = response.headers.get('x-search-performed') === 'true';
      setIsSearchingWeb(false);

      const initialAssistantMessage: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        searchPerformed,
      };

      // Append blank assistant message to chat
      setChats(prev => prev.map(c => {
        if (c.id === targetChatId) {
          return {
            ...c,
            messages: [...c.messages, initialAssistantMessage],
          };
        }
        return c;
      }));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      setIsTyping(false);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          accumulatedText += chunk;

          setChats(prev => prev.map(c => {
            if (c.id === targetChatId) {
              return {
                ...c,
                messages: c.messages.map(m => {
                  if (m.id === assistantMsgId) {
                    return { ...m, content: accumulatedText };
                  }
                  return m;
                })
              };
            }
            return c;
          }));
        }
      }
    } catch (err: any) {
      console.error("useChat error:", err);
      setIsSearchingWeb(false);

      const errorMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message || 'Unknown error'}. Please verify that you have added your GROQ_API_KEY to your .env.local file.`,
        searchPerformed: false,
      };

      setChats(prev => prev.map(c => {
        if (c.id === targetChatId) {
          return {
            ...c,
            messages: [...c.messages, errorMsg],
          };
        }
        return c;
      }));
      setIsTyping(false);
      return; // Do not call clarity since main response failed
    }

    // Now trigger Clarity analysis
    // Update state to set loading clarity
    setChats(prev => prev.map(c => {
      if (c.id === targetChatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === assistantMsgId) {
              return {
                ...m,
                clarity: {
                  flags: [],
                  assumptions: [],
                  isLoading: true,
                }
              };
            }
            return m;
          })
        };
      }
      return c;
    }));

    try {
      const clarityResponse = await fetch('/api/clarity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responseText: accumulatedText,
          userPrompt: text,
          searchPerformed,
        }),
      });

      if (!clarityResponse.ok) {
        throw new Error("Clarity analysis API error.");
      }

      const clarityData = await clarityResponse.json();

      const flags: ConfidenceFlag[] = (clarityData.flags || []).map((f: any, index: number) => {
        const startIndex = accumulatedText.indexOf(f.sentence);
        return {
          id: f.id || `f-${index}-${Math.random().toString(36).substring(4)}`,
          sentence: f.sentence,
          reason: f.reason,
          confidence_level: f.confidence_level || 'moderate',
          verification_pointer: f.verification_pointer || '',
          depends_on: f.depends_on || null,
          startIndex: startIndex !== -1 ? startIndex : 0,
          endIndex: startIndex !== -1 ? startIndex + f.sentence.length : 0,
        };
      });

      const assumptions: Assumption[] = (clarityData.assumptions || []).map((a: any, index: number) => ({
        id: a.id || `a-${index}-${Math.random().toString(36).substring(4)}`,
        text: a.text,
        isEditing: false,
        isStatic: a.isStatic || false,
        impact: a.impact || 'low',
        suggestions: a.suggestions || [],
      }));

      setChats(prev => prev.map(c => {
        if (c.id === targetChatId) {
          return {
            ...c,
            messages: c.messages.map(m => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  clarity: {
                    flags,
                    assumptions,
                    isLoading: false,
                  }
                };
              }
              return m;
            })
          };
        }
        return c;
      }));
    } catch (clarityError) {
      console.error("Clarity error:", clarityError);
      // Fail gracefully - set isLoading to false and mark isError
      setChats(prev => prev.map(c => {
        if (c.id === targetChatId) {
          return {
            ...c,
            messages: c.messages.map(m => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  clarity: {
                    flags: [],
                    assumptions: [],
                    isLoading: false,
                    isError: true,
                  }
                };
              }
              return m;
            })
          };
        }
        return c;
      }));
    }
  };

  return {
    chats,
    currentChat,
    messages,
    inputText,
    setInputText,
    sendMessage,
    startNewChat,
    selectChat,
    isTyping,
    isSearchingWeb,
    updateFlagFeedback,
    toggleEditingAssumption,
    updateAssumption,
    regenerateWithCorrections,
    submitClarityFeedback,
    setChats,
  };
}
