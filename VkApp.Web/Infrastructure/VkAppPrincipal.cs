using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using VkApp.Data;

namespace VkApp.Web.Infrastructure
{
    class VkAppPrincipal : IPrincipal
    {
        private readonly IEnumerable<string> _roles;

        public VkAppPrincipal(string role, Permissions permissions)
        {
            Identity = new GenericIdentity(role);
            Permissions = permissions;
            _roles = Role.GelAvailableRoles(role);
        }

        public bool IsInRole(string role)
        {
            return _roles.Any(x => x.Equals(role));
        }

        public IIdentity Identity { get; }
        public Permissions Permissions { get; }
    }

    public static class PrincipalExtensions
    {
        public static Permissions Permissions(this IPrincipal principal)
        {
            return (principal as VkAppPrincipal)?.Permissions;
        }
    }
}