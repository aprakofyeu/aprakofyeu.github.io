using System;
using System.Collections.Generic;
using System.Linq;
using NHibernate;
using NHibernate.Linq;
using VkApp.Web.Data.Model;

namespace VkApp.Web.Data
{
    public interface IApplicationsProvider
    {
        IEnumerable<Application> GetAllApplications();
        void Remove(int id);
        string Add(Application map);
        int GetNextApplicationId();
        void IncreaseApplicationCount(int applicationId);
    }

    class ApplicationsProvider : IApplicationsProvider
    {
        private readonly ISession _session;
        private readonly Random _random;

        public ApplicationsProvider(ISession session, Random random)
        {
            _session = session;
            _random = random;
        }

        public IEnumerable<Application> GetAllApplications()
        {
            return _session.Query<Application>().ToList();
        }

        public void Remove(int id)
        {
            var app = _session.Query<Application>().FirstOrDefault(x => x.VkAppId == id);
            _session.Delete(app);
        }

        public string Add(Application newApplication)
        {
            if (_session.Query<Application>().Any(x => x.VkAppId == newApplication.VkAppId))
                return $"Application '{newApplication.VkAppId}' already exists";

            _session.Save(newApplication);
            return null;
        }

        public int GetNextApplicationId()
        {
            var applications = GetAllApplications();
            var randomIndex = _random.Next(0, applications.Count());
            return applications.ElementAt(randomIndex).VkAppId;
        }

        public void IncreaseApplicationCount(int applicationId)
        {
            _session
                .CreateSQLQuery(@"UPDATE Application SET MessagesCount = MessagesCount + 1 
                                  WHERE VkAppId = :applicationId")
                .SetParameter("applicationId", applicationId)
                .ExecuteUpdate();
        }
    }
}