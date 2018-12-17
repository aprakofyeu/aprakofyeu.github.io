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
    }

    class ApplicationsProvider: IApplicationsProvider
    {
        private ISession _session;
        public ApplicationsProvider(ISession session)
        {
            _session = session;
        }

        public IEnumerable<Application> GetAllApplications()
        {
            return _session.Query<Application>().ToList();
        }
    }
}