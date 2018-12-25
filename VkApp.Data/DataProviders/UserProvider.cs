﻿using NHibernate;
using VkApp.Data.Model;

namespace VkApp.Data.DataProviders
{
    public interface IUserProvider
    {
        void AddUserSafe(User user);
    }

    internal class UserProvider: IUserProvider
    {
        private readonly ISession _session;

        public UserProvider(ISession session)
        {
            _session = session;
        }

        public void AddUserSafe(User user)
        {
            _session
                .CreateSQLQuery(@"IF NOT EXISTS (SELECT * FROM [dbo].[User] WHERE VkUserId = :vkUserId) 
                                  BEGIN
                                    INSERT INTO [dbo].[User] (VkUserId, FirstName, LastName) VALUES (:vkUserId, :firstName, :lastName)
                                  END")
                .SetParameter("vkUserId", user.VkUserId)
                .SetParameter("firstName", user.FirstName)
                .SetParameter("lastName", user.LastName)
                .ExecuteUpdate();
        }
    }
}