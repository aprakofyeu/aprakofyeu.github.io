using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate;
using VkApp.Data.Model;

namespace VkApp.Data.DataProviders
{
    public interface IMessagesProvider
    {
        bool AddMessage(int vkUserId, int vkTargetGroupId, int vkTargetUserId);
        void AddMessages(IEnumerable<Message> messages);
        bool IsUserMessagesInitialized(int userId);
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