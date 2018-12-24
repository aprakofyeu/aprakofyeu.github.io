﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate;
using VkApp.Web.Data.Model;

namespace VkApp.Web.Data
{
    public interface IMessagesProvider
    {
        bool AddMessage(int vkUserId, int vkTargetGroupId, int vkTargetUserId);
        void AddMessages(IEnumerable<Message> messages);
        bool IsUserMessagesInitialized(int userId);
        IEnumerable<int> GetUsersWithoutMessagesByGroup(int targetGroupId, IEnumerable<int> userIds);
        bool HaveUserMessagesByGroup(int targetGroupId, int targetUserId);
    }

    public class MessagesProvider : IMessagesProvider
    {
        private readonly ISession _session;

        public MessagesProvider(ISession session)
        {
            _session = session;
        }

        public bool AddMessage(int vkUserId, int vkTargetGroupId, int vkTargetUserId)
        {
            if (HaveUserMessagesByGroup(vkTargetGroupId, vkTargetUserId))
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

        public void AddMessages(IEnumerable<Message> messages)
        {
            if (messages == null || !messages.Any())
            {
                return;
            }

            var vkTargetGroupId = messages.First().VkTargetGroupId;

            var existsUsersDict = _session
                .CreateSQLQuery("SELECT vkTargetUserId FROM Messages WHERE VkTargetGroupId=:VkTargetGroupId")
                .SetParameter("VkTargetGroupId", vkTargetGroupId)
                .List<int>()
                .ToDictionary(x => x);

            messages = messages.Where(x => !existsUsersDict.ContainsKey(x.VkTargetUserId));
            if (messages.Any())
            {

                var insertSql = new StringBuilder();
                foreach (var message in messages)
                {
                    insertSql.AppendLine(
                        "INSERT INTO Messages (VkSenderId, VkTargetGroupId, VkTargetUserId, SentDate) " +
                        $"VALUES ({message.VkSenderId},{message.VkTargetGroupId},{message.VkTargetUserId},{ToDbDate(message.SentDate)})");
                }

                _session
                    .CreateSQLQuery(insertSql.ToString())
                    .ExecuteUpdate();
            }
        }

        public bool IsUserMessagesInitialized(int userId)
        {
            return _session
                .CreateSQLQuery(@"SELECT CASE WHEN EXISTS 
                                    (SELECT * FROM Messages WHERE VkSenderId = :userId)
                                THEN CAST(1 AS BIT)
                                ELSE CAST(0 AS BIT) END")
                .SetParameter("userId", userId)
                .UniqueResult<bool>();
        }

        public IEnumerable<int> GetUsersWithoutMessagesByGroup(int targetGroupId, IEnumerable<int> userIds)
        {
            if (userIds == null || !userIds.Any())
                return Enumerable.Empty<int>();

            var usersWithMessagesDict = _session
                .CreateSQLQuery(@"SELECT VkTargetUserId FROM Messages
                                  WHERE VkTargetGroupId = :targetGroupId
                                  AND VkTargetUserId IN (:userIds)")
                .SetParameter("targetGroupId", targetGroupId)
                .SetParameterList("userIds", userIds)
                .List<int>()
                .ToDictionary(x => x);

            return userIds
                .Where(x => !usersWithMessagesDict.ContainsKey(x))
                .ToList();
        }

        public bool HaveUserMessagesByGroup(int targetGroupId, int targetUserId)
        {
            var messagesCount = _session
                .CreateSQLQuery(@"SELECT COUNT(*) FROM Messages
                                  WHERE VkTargetGroupId = :targetGroupId
                                  AND VkTargetUserId = :targetUserId")
                .SetParameter("targetGroupId", targetGroupId)
                .SetParameter("targetUserId", targetUserId)
                .UniqueResult<int>();

            return messagesCount > 0;
        }
    }
}