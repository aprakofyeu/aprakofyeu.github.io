using System;
using System.Collections.Generic;
using System.Linq;
using NHibernate;
using NHibernate.Linq;
using NHibernate.Transform;
using VkApp.Data.Model;

namespace VkApp.Data.DataProviders
{
    public interface IUserSavedMessagesProvider
    {
        IEnumerable<SavedMessage> GetSavedMessages(int userId, int groupId);
        void SaveMessages(IEnumerable<SavedMessage> message);
        void DeleteMessages(int userId);
    }

    class UserSavedMessagesProvider: IUserSavedMessagesProvider
    {
        private readonly ISession _session;

        public UserSavedMessagesProvider(ISession session)
        {
            _session = session;
        }

        public IEnumerable<SavedMessage> GetSavedMessages(int userId, int groupId)
        {
            return _session
                .CreateSQLQuery("SELECT Message, Attachments FROM UserSavedMessages " +
                                "WHERE VkUserId=:userId AND TargetGroupId=:groupId " +
                                "ORDER BY OrderIndex")
                .SetParameter("userId", userId)
                .SetParameter("groupId", groupId)
                .SetResultTransformer(Transformers.AliasToBean<SavedMessage>())
                .List<SavedMessage>();
        }

        public void SaveMessages(IEnumerable<SavedMessage> messages)
        {
            var userId = messages.First().UserId;
            var groupId = messages.First().GroupId;

            //remove old messages
            _session
                .CreateSQLQuery("DELETE FROM UserSavedMessages WHERE VkUserId=:userId AND TargetGroupId=:groupId")
                .SetParameter("userId", userId)
                .SetParameter("groupId", groupId)
                .ExecuteUpdate();

            //save new messages
            foreach (var message in messages)
            {
                _session
                    .CreateSQLQuery(
                        @"INSERT INTO UserSavedMessages (VkUserId, TargetGroupId, Message, Attachments, OrderIndex) VALUES (:userId, :groupId, :message, :attachments, :orderIndex)")
                    .SetParameter("userId", message.UserId)
                    .SetParameter("groupId", message.GroupId)
                    .SetParameter("message", message.Message)
                    .SetParameter("attachments", message.Attachments)
                    .SetParameter("orderIndex", message.Order)
                    .ExecuteUpdate();
            }
        }

        public void DeleteMessages(int userId)
        {
            _session.CreateSQLQuery("DELETE FROM UserSavedMessages WHERE VkUserId=:userId")
                .SetParameter("userId", userId)
                .ExecuteUpdate();
        }
    }
}
