using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate;
using NHibernate.Transform;
using VkApp.Data.Model;

namespace VkApp.Data.DataProviders
{
    public interface IStatisticsProvider
    {
        IEnumerable<StatisticsGroup> GetStatisticsGroupsForTargetGroup(int groupId);
        StatisticsGroup GetStatisticsGroup(int statisticsGroupId);
        int GetTargetGroupIdForStatisticsGroup(int statisticsGroupId);
        void Save(StatisticsGroup statisticsGroup);
        void Remove(int statisticsGroupId);
    }

    class StatisticsProvider : IStatisticsProvider
    {
        private readonly ISession _session;
        private readonly IUserProvider _userProvider;

        public StatisticsProvider(ISession session, IUserProvider userProvider)
        {
            _session = session;
            _userProvider = userProvider;
        }

        private sealed class StatisticsGroupRaw
        {
            public int Id { get; set; }
            public int TargetGroupId { get; set; }
            public string Name { get; set; }
            public int UserId { get; set; }
        }

        private sealed class Identity
        {
            public int Id { get; set; }
        }

        public IEnumerable<StatisticsGroup> GetStatisticsGroupsForTargetGroup(int groupId)
        {
            var allUsers = _userProvider.GetUsersByGroup(groupId);

            var statisticsGroupsRaw = _session.CreateSQLQuery(@"
                    SELECT Id, TargetGroupId, Name, UserId FROM StatisticsGroup sg
                    LEFT JOIN StatisticsGroupUsers sgu ON sg.Id = sgu.StatisticsGroupId
                    WHERE sg.TargetGroupId=:groupId")
                .SetParameter("groupId", groupId)
                .SetResultTransformer(Transformers.AliasToBean(typeof(StatisticsGroupRaw)))
                .List<StatisticsGroupRaw>();

            var statisticsGroups = MapStatisticsGroups(statisticsGroupsRaw);

            statisticsGroups.Add(new StatisticsGroup
            {
                Name = "All",
                SelectedUsers = allUsers.Select(u => u.VkUserId).ToList()
            });

            return statisticsGroups;
        }

        public StatisticsGroup GetStatisticsGroup(int statisticsGroupId)
        {
            var statisticsGroupsRaw = _session.CreateSQLQuery(@"
                    SELECT Id, TargetGroupId, Name, UserId FROM StatisticsGroup sg
                    LEFT JOIN StatisticsGroupUsers sgu ON sg.Id = sgu.StatisticsGroupId
                    WHERE sg.Id=:statisticsGroupId")
                .SetParameter("statisticsGroupId", statisticsGroupId)
                .SetResultTransformer(Transformers.AliasToBean(typeof(StatisticsGroupRaw)))
                .List<StatisticsGroupRaw>();

            var statisticsGroups = MapStatisticsGroups(statisticsGroupsRaw);

            return statisticsGroups.Single();
        }

        public int GetTargetGroupIdForStatisticsGroup(int statisticsGroupId)
        {
            return _session.CreateSQLQuery(@"
                    SELECT TargetGroupId FROM StatisticsGroup
                    WHERE Id=:statisticsGroupId")
                .SetParameter("statisticsGroupId", statisticsGroupId)
                .UniqueResult<int>();
        }

        private static IList<StatisticsGroup> MapStatisticsGroups(IEnumerable<StatisticsGroupRaw> statisticsGroupsRaw)
        {
            return statisticsGroupsRaw
                .GroupBy(x => x.Id)
                .Select(x => new StatisticsGroup
                {
                    Id = x.Key,
                    TargetGroupId = x.First().TargetGroupId,
                    Name = x.First().Name,
                    SelectedUsers = x.Select(g => g.UserId).Where(userId => userId > 0).ToList()
                })
                .ToList();
        }

        public void Save(StatisticsGroup statisticsGroup)
        {
            if (!statisticsGroup.Id.HasValue)
            {
                AddStatisticsGroup(statisticsGroup);
            }
            else
            {
                UpdateStatisticsGroup(statisticsGroup);
            }

            UpdateStatisticsGroupUsers(statisticsGroup);
        }

        private void UpdateStatisticsGroupUsers(StatisticsGroup statisticsGroup)
        {
            var statisticsGroupId = statisticsGroup.Id.Value;
            RemoveStatisticsGroupUsers(statisticsGroupId);

            var insertSql = new StringBuilder();
            foreach (var userId in statisticsGroup.SelectedUsers)
            {
                insertSql.AppendLine(
                    $"INSERT INTO StatisticsGroupUsers (StatisticsGroupId, UserId) VALUES ({statisticsGroupId},{userId})");
            }

            _session
                .CreateSQLQuery(insertSql.ToString())
                .ExecuteUpdate();
        }

        private void UpdateStatisticsGroup(StatisticsGroup statisticsGroup)
        {
            _session.CreateSQLQuery(@"
                    UPDATE StatisticsGroup SET Name=:name
                    WHERE Id=:statisticsGroupId")
                .SetParameter("name", statisticsGroup.Name)
                .SetParameter("statisticsGroupId", statisticsGroup.Id)
                .ExecuteUpdate();
        }

        private void AddStatisticsGroup(StatisticsGroup statisticsGroup)
        {
            var identity = _session.CreateSQLQuery(@"
                    INSERT INTO StatisticsGroup (Name, TargetGroupId)
                    VALUES (:name, :targetGroupId)
                    SELECT CAST(SCOPE_IDENTITY() AS INTEGER) AS Id")
                .SetParameter("name", statisticsGroup.Name)
                .SetParameter("targetGroupId", statisticsGroup.TargetGroupId)
                .SetResultTransformer(Transformers.AliasToBean(typeof(Identity)))
                .UniqueResult<Identity>();

            statisticsGroup.Id = identity.Id;
        }

        public void Remove(int statisticsGroupId)
        {
            RemoveStatisticsGroupUsers(statisticsGroupId);

            _session.CreateSQLQuery(@"
                    DELETE FROM StatisticsGroup 
                    WHERE Id = :statisticsGroupId")
                .SetParameter("statisticsGroupId", statisticsGroupId)
                .ExecuteUpdate();
        }

        private void RemoveStatisticsGroupUsers(int statisticsGroupId)
        {
            _session.CreateSQLQuery(@"
                    DELETE FROM StatisticsGroupUsers 
                    WHERE StatisticsGroupId = :statisticsGroupId")
                .SetParameter("statisticsGroupId", statisticsGroupId)
                .ExecuteUpdate();
        }
    }
}
