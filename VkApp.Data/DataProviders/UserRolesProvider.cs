using System.Collections.Generic;
using System.Linq;
using NHibernate;
using NHibernate.Linq;
using VkApp.Data.Model;

namespace VkApp.Data.DataProviders
{
    public interface IUserRolesProvider
    {
        string GetRoleByPassword(string password);
        IEnumerable<RoleDto> GetUserRoles();
        IEnumerable<string> GetRolePasswords(string role);
        void Remove(int id);
        void AddUserPassword(string password, string comment);
    }

    class UserRolesProvider : IUserRolesProvider
    {
        private readonly ISession _session;

        public UserRolesProvider(ISession session)
        {
            _session = session;
        }

        public string GetRoleByPassword(string password)
        {
            if (!string.IsNullOrEmpty(password))
            {
                var role = _session
                    .QueryOver<RoleDto>()
                    .Where(x => x.Password == password)
                    .SingleOrDefault();

                if (role != null && Role.AllRoles.Contains(role.Name))
                    return role.Name;
            }

            return null;
        }

        public IEnumerable<RoleDto> GetUserRoles()
        {
            return _session
                .Query<RoleDto>()
                .Where(x => x.Name == Role.User)
                .ToList();
        }

        public IEnumerable<string> GetRolePasswords(string role)
        {
            return _session
                .CreateSQLQuery("SELECT Password FROM Roles WHERE Role=:role")
                .SetParameter("role", role)
                .List<string>();
        }

        public void Remove(int id)
        {
            var app = _session.Query<RoleDto>().FirstOrDefault(x => x.Id == id);
            _session.Delete(app);
        }

        public void AddUserPassword(string password, string comment)
        {
            _session.SaveOrUpdate(new RoleDto
            {
                Name = Role.User,
                Password = password,
                Comment = comment
            });
        }
    }
}
