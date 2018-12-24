using System.Collections.Generic;
using System.Linq;
using NHibernate;
using NHibernate.Linq;
using VkApp.Web.Data.Model;

namespace VkApp.Web.Data
{
    public interface IGroupProvider
    {
        void AddGroupSafe(Group group);
        IEnumerable<Group> GetAll();
        int GetPreferredGroup(int userId);
    }
    public class GroupProvider: IGroupProvider
    {
        private readonly ISession _session;

        public GroupProvider(ISession session)
        {
            _session = session;
        }

        public void AddGroupSafe(Group group)
        {
            _session
                .CreateSQLQuery(@"IF NOT EXISTS (SELECT * FROM TargetGroup WHERE VkGroupId = :VkGroupId) 
                                  BEGIN
                                      INSERT INTO TargetGroup (VkGroupId, Name) VALUES (:VkGroupId, :Name)
                                  END")
                .SetParameter("VkGroupId", group.VkGroupId)
                .SetParameter("Name", group.Name)
                .ExecuteUpdate();
        }

        public IEnumerable<Group> GetAll()
        {
            return _session.Query<Group>().ToList();
        }

        public int GetPreferredGroup(int userId)
        {
            return _session
                .CreateSQLQuery(@"SELECT TOP 1 VkTargetGroupId FROM Messages
                                WHERE VkSenderId = :VkSenderId
                                ORDER BY SentDate DESC")
                .SetParameter("VkSenderId", userId)
                .UniqueResult<int>();
        }
    }
}