using System;
using System.Linq;
using NHibernate;
using NHibernate.Linq;
using VkApp.Data.Model;

namespace VkApp.Data.DataProviders
{
    public interface IUserSavedMessagesProvider
    {
        SavedMessage GetSavedMessage(int userId, int groupId);
        void SaveMessage(SavedMessage message);
        void DeleteMessages(int userId);
    }

    class UserSavedMessagesProvider: IUserSavedMessagesProvider
    {
        private readonly ISession _session;

        public UserSavedMessagesProvider(ISession session)
        {
            _session = session;
        }

        public SavedMessage GetSavedMessage(int userId, int groupId)
        {
            return _session.Query<SavedMessage>()
                .FirstOrDefault(x => x.UserId == userId && x.GroupId == groupId);
        }

        public void SaveMessage(SavedMessage message)
        {
            _session
                .CreateSQLQuery(
                    @"IF NOT EXISTS (SELECT * FROM UserSavedMessages WHERE VkUserId=:userId AND TargetGroupId=:groupId) 
                        BEGIN
                            INSERT INTO UserSavedMessages (VkUserId, TargetGroupId, Message, Attachments) VALUES (:userId, :groupId, :message, :attachments)
                        END ELSE BEGIN
                            UPDATE UserSavedMessages SET Message=:message, Attachments=:attachments WHERE VkUserId = :userId AND TargetGroupId=:groupId
                        END")
                .SetParameter("userId", message.UserId)
                .SetParameter("groupId", message.GroupId)
                .SetParameter("message", message.Message)
                .SetParameter("attachments", message.Attachments)
                .ExecuteUpdate();
        }

        public void DeleteMessages(int userId)
        {
            _session.CreateSQLQuery("DELETE FROM UserSavedMessages WHERE VkUserId=:userId")
                .SetParameter("userId", userId)
                .ExecuteUpdate();
        }
    }
}
