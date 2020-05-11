﻿using System;
using System.Collections.Generic;
using System.Linq;
using NHibernate;
using VkApp.Data.Model;

namespace VkApp.Data.DataProviders
{
    public interface IMessagesProvider
    {
        bool AddMessage(int vkUserId, int vkTargetGroupId, int vkTargetUserId);
        IEnumerable<int> GetUsersWithoutMessagesByGroupOrSender(int targetGroupId, int senderUserId, IEnumerable<int> userIds);
        bool HaveUserMessagesByGroupOrSender(int targetGroupId, int senderUserId, int targetUserId);
        IEnumerable<Message> GetAllMessagesByGroup(int targetGroupId);
        void UndoMessage(int targetGroupId, int targetUserId);
    }

    internal class MessagesProvider : IMessagesProvider
    {
        private readonly ISession _session;

        public MessagesProvider(ISession session)
        {
            _session = session;
        }

        public bool AddMessage(int vkUserId, int vkTargetGroupId, int vkTargetUserId)
        {
            if (HaveUserMessagesByGroupOrSender(vkTargetGroupId, vkUserId, vkTargetUserId))
                return false;

            _session.Save(new Message
            {
                VkSenderId = vkUserId,
                VkTargetGroupId = vkTargetGroupId,
                VkTargetUserId = vkTargetUserId,
                SentDate = DateTime.UtcNow
            });

            return true;
        }

        private static string ToDbDate(DateTime date)
        {
            return $"'{date:yyyy-MM-dd HH:mm:ss.fff}'";
        }

        public IEnumerable<int> GetUsersWithoutMessagesByGroupOrSender(int targetGroupId, int senderUserId, IEnumerable<int> userIds)
        {
            if (userIds == null || !userIds.Any())
                return Enumerable.Empty<int>();

            var usersWithMessagesDict = _session
                .CreateSQLQuery(@"SELECT DISTINCT VkTargetUserId FROM Messages
                                  WHERE (VkTargetGroupId = :targetGroupId OR VkSenderId = :senderUserId)
                                  AND VkTargetUserId IN (:userIds)")
                .SetParameter("targetGroupId", targetGroupId)
                .SetParameter("senderUserId", senderUserId)
                .SetParameterList("userIds", userIds)
                .List<int>()
                .ToDictionary(x => x);

            return userIds
                .Where(x => !usersWithMessagesDict.ContainsKey(x))
                .ToList();
        }

        public bool HaveUserMessagesByGroupOrSender(int targetGroupId, int senderUserId, int targetUserId)
        {
            var messagesCount = _session
                .CreateSQLQuery(@"SELECT COUNT(*) FROM Messages
                                  WHERE (VkTargetGroupId = :targetGroupId OR VkSenderId = :senderUserId)
                                  AND VkTargetUserId = :targetUserId")
                .SetParameter("targetGroupId", targetGroupId)
                .SetParameter("senderUserId", senderUserId)
                .SetParameter("targetUserId", targetUserId)
                .UniqueResult<int>();

            return messagesCount > 0;
        }

        public IEnumerable<Message> GetAllMessagesByGroup(int targetGroupId)
        {
            return _session.QueryOver<Message>()
                .Where(x => x.VkTargetGroupId == targetGroupId)
                .List();
        }

        public void UndoMessage(int targetGroupId, int targetUserId)
        {
            _session
                .CreateSQLQuery(@"DELETE FROM Messages
                                    WHERE VkTargetGroupId = :targetGroupId
                                    AND VkTargetUserId = :targetUserId")
                .SetParameter("targetGroupId", targetGroupId)
                .SetParameter("targetUserId", targetUserId)
                .ExecuteUpdate();
        }
    }
}