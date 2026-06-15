import { Router, Request, Response } from 'express';
import * as conversationService from '../services/conversationService';
import * as messageService from '../services/messageService';
import { generateReply } from '../services/llmService';
import { PostMessageBody, PostMessageResponse, GetHistoryResponse } from '../types/index';

const router = Router();

router.post('/message', async (req: Request, res: Response): Promise<void> => {
  const { message, sessionId } = req.body as PostMessageBody;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({ error: 'Message cannot be empty.' });
    return;
  }

  if (message.trim().length > 2000) {
    res.status(400).json({ error: 'Message exceeds 2000 character limit.' });
    return;
  }

  try {
    const conversation = conversationService.getOrCreateConversation(sessionId);

    messageService.saveMessage(conversation.id, 'user', message.trim());

    const recentMessages = messageService.getRecentMessagesForLLM(conversation.id);

    const aiReply = await generateReply(recentMessages, message.trim());

    messageService.saveMessage(conversation.id, 'ai', aiReply);

    const response: PostMessageResponse = { reply: aiReply, sessionId: conversation.id };
    res.status(200).json(response);
  } catch (err) {
    console.error('[CAUGHT ERROR]', err instanceof Error ? err.message : err);
    console.error('[STACK]', err instanceof Error ? err.stack : '');
    res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
});

router.get('/:sessionId', (req: Request, res: Response): void => {
  const { sessionId } = req.params;

  try {
    const conversation = conversationService.getConversationById(sessionId);

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found.' });
      return;
    }

    const messages = messageService.getMessagesByConversation(conversation.id);

    const response: GetHistoryResponse = { sessionId: conversation.id, messages };
    res.status(200).json(response);
  } catch (err) {
    console.error('GET /:sessionId error:', err);
    res.status(500).json({ error: 'Failed to load conversation history.' });
  }
});

export default router;
