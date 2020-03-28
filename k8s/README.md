# Kubernetes Documentation

Unfortunately, this work was interrupted. Here's a little summary of what has
been done and what's left to be done to run challenge-services with
Kubernetes.

## What has been done

- event-scanner and redis have both been converted to `kind: Deployment`
- A secret for event-scanner has been created to store its Infura key
- Volumes for redis have been created

All changes have been made to the `k8s` folder. To launch the deployments in
a Kubernetes cluster, you'll have to have `minicube` and `kubectl` installed.

```
$ minicube start
$ kubectl apply -f <file>
# Same for other files
```

## What's left to do

- Mount event-scanner's `config.json` into application somehow. From what I
  understand, Kubernetes ConfigMap is great for that
- Create deployment for `watchtower/containrrr` to include it into the
  cluster

## Future improvements

Kubernetes allows a developer to do pretty awesome things like:

- Use [kops](https://github.com/kubernetes/kops) to do automatic cloud
  deployment of the service
- Use Kubernetes' [health
  probing](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
  to ensure that an application is online.
